import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";

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
  // POST /api/sessions — crée une séance "quotidienne" en piochant un
  // exercice par catégorie (dans l'esprit de la routine 20-25 min du manuel).
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

    const chosenExercises: { id: string }[] = [];
    for (const categoryCode of DAILY_CATEGORY_ORDER) {
      const { data: category } = await client
        .from("exercise_categories")
        .select("id")
        .eq("code", categoryCode)
        .single();
      if (!category) continue;

      // On pioche un exercice au hasard dans la catégorie. Pour un vrai
      // aléatoire côté SQL on utiliserait order("random()"), non supporté
      // nativement par le client JS — on récupère un lot et on tire en JS.
      const { data: candidates } = await client
        .from("exercises")
        .select("id")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .limit(50);

      if (candidates && candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        chosenExercises.push(pick);
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

    return { ...session, session_exercises: sessionExercises };
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
