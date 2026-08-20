import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";
import { computeCategoryRatings, suggestedDifficulty } from "../coach/categoryWeakness.js";

// Ordre pédagogique repris du manuel : respiration -> échauffement ->
// articulation -> virelangues -> lecture -> improvisation.
const DAILY_CATEGORY_ORDER = [
  "respiration",
  "echauffement",
  "articulation",
  "virelangues",
  "lecture",
  "improvisation"
];

const completeExerciseSchema = z.object({
  self_rating: z.number().int().min(1).max(10).optional()
});

export async function sessionsRoutes(app: FastifyInstance) {
  // POST /api/sessions — crée une séance adaptative : un exercice par
  // catégorie comme base (esprit de la routine du manuel), plus un exercice
  // supplémentaire dans la catégorie la plus faible de l'utilisateur
  // (déterminée à partir de ses auto-évaluations passées). La difficulté
  // ciblée dans chaque catégorie s'ajuste aussi à la moyenne obtenue.
  // Entièrement déterministe, sans appel IA (voir coach/categoryWeakness.ts).
  app.post("/api/sessions", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);

    const { data: session, error: sessionError } = await client
      .from("sessions")
      .insert({ user_id: request.userId, type: "quotidienne" })
      .select()
      .single();

    if (sessionError || !session) {
      request.log.error(sessionError);
      return reply.code(500).send({ message: "Impossible de créer la séance" });
    }

    let categoryRatings: Awaited<ReturnType<typeof computeCategoryRatings>> = [];
    try {
      categoryRatings = await computeCategoryRatings(client, request.userId!);
    } catch (err) {
      // Pas bloquant : sans données de notation, on retombe simplement sur
      // une séance non biaisée (comportement de la version précédente).
      request.log.error(err);
    }

    const ratingsByCode = new Map(categoryRatings.map((r) => [r.code, r]));
    const weakest = categoryRatings
      .filter((r) => r.count >= 1)
      .sort((a, b) => a.averageRating - b.averageRating)[0];

    const chosenExercises: { id: string }[] = [];

    for (const categoryCode of DAILY_CATEGORY_ORDER) {
      const { data: category } = await client
        .from("exercise_categories")
        .select("id")
        .eq("code", categoryCode)
        .single();
      if (!category) continue;

      const desiredCount = weakest && categoryCode === weakest.code ? 2 : 1;
      const rating = ratingsByCode.get(categoryCode);
      const targetDifficulty = rating && rating.count >= 2 ? suggestedDifficulty(rating.averageRating) : null;

      // On tente d'abord avec la difficulté ciblée ; si ça ne renvoie pas
      // assez d'exercices (catégorie peu fournie à ce niveau), on retombe
      // sur l'ensemble de la catégorie plutôt que de laisser un trou dans
      // la séance.
      let candidatesQuery = client
        .from("exercises")
        .select("id")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .limit(50);
      if (targetDifficulty) candidatesQuery = candidatesQuery.eq("difficulty", targetDifficulty);

      let { data: candidates } = await candidatesQuery;
      if (!candidates || candidates.length < desiredCount) {
        const fallback = await client
          .from("exercises")
          .select("id")
          .eq("category_id", category.id)
          .eq("is_active", true)
          .limit(50);
        candidates = fallback.data;
      }

      if (!candidates || candidates.length === 0) continue;

      // Tirage sans remise dans les candidats disponibles pour cette catégorie
      const pool = [...candidates];
      for (let i = 0; i < desiredCount && pool.length > 0; i++) {
        const index = Math.floor(Math.random() * pool.length);
        chosenExercises.push(pool[index]);
        pool.splice(index, 1);
      }
    }

    if (chosenExercises.length === 0) {
      return reply.code(500).send({ message: "Aucun exercice disponible pour générer la séance" });
    }

    const rows = chosenExercises.map((ex, index) => ({
      session_id: session.id,
      exercise_id: ex.id,
      display_order: index
    }));

    const { data: sessionExercises, error: seError } = await client
      .from("session_exercises")
      .insert(rows)
      .select("id, display_order, completed, exercise_id, exercises(title, difficulty, duration_sec, target_skill, instructions, content, exercise_categories(code, name))");

    if (seError) {
      request.log.error(seError);
      return reply.code(500).send({ message: "Impossible d'associer les exercices à la séance" });
    }

    return {
      ...session,
      session_exercises: sessionExercises,
      adapted_for_category: weakest?.code ?? null
    };
  });

  // GET /api/sessions/:id — relit une séance avec ses exercices
  app.get<{ Params: { id: string } }>(
    "/api/sessions/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      const { data, error } = await client
        .from("sessions")
        .select(
          "*, session_exercises(id, display_order, completed, self_rating, exercise_id, exercises(title, difficulty, duration_sec, target_skill, instructions, content, exercise_categories(code, name)))"
        )
        .eq("id", request.params.id)
        .single();

      if (error || !data) {
        return reply.code(404).send({ message: "Séance introuvable" });
      }
      return data;
    }
  );

  // PATCH /api/sessions/:sessionId/exercises/:sessionExerciseId — marque un
  // exercice de la séance comme terminé, avec une auto-évaluation optionnelle.
  app.patch<{ Params: { sessionId: string; sessionExerciseId: string } }>(
    "/api/sessions/:sessionId/exercises/:sessionExerciseId",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = completeExerciseSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Payload invalide", errors: parsed.error.flatten() });
      }

      const client = supabaseForUser(request.accessToken!);
      const { data, error } = await client
        .from("session_exercises")
        .update({ completed: true, self_rating: parsed.data.self_rating, completed_at: new Date().toISOString() })
        .eq("id", request.params.sessionExerciseId)
        .eq("session_id", request.params.sessionId)
        .select()
        .single();

      if (error || !data) {
        request.log.error(error);
        return reply.code(404).send({ message: "Exercice de séance introuvable" });
      }
      return data;
    }
  );

  // PATCH /api/sessions/:id/complete — clôture la séance
  app.patch<{ Params: { id: string } }>(
    "/api/sessions/:id/complete",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      const { data, error } = await client
        .from("sessions")
        .update({ status: "terminee", ended_at: new Date().toISOString() })
        .eq("id", request.params.id)
        .select()
        .single();

      if (error || !data) {
        request.log.error(error);
        return reply.code(404).send({ message: "Séance introuvable" });
      }
      return data;
    }
  );
}
