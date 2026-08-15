import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";

export async function exercisesRoutes(app: FastifyInstance) {
  // GET /api/exercises?category=virelangues&difficulty=facile
  // Contenu public (toute personne authentifiée), donc client scopé
  // utilisateur suffit — RLS l'autorise déjà (policy exercises_select_active).
  app.get<{ Querystring: { category?: string; difficulty?: string } }>(
    "/api/exercises",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      let query = client
        .from("exercises")
        .select("id, title, difficulty, duration_sec, target_skill, content, exercise_categories(code, name)")
        .eq("is_active", true);

      if (request.query.difficulty) {
        query = query.eq("difficulty", request.query.difficulty);
      }
      if (request.query.category) {
        // filtre par code de catégorie via une sous-requête (jointure Supabase)
        const { data: cat } = await client
          .from("exercise_categories")
          .select("id")
          .eq("code", request.query.category)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      const { data, error } = await query.limit(200);
      if (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Impossible de charger les exercices" });
      }
      return data;
    }
  );

  // GET /api/exercises/:id
  app.get<{ Params: { id: string } }>(
    "/api/exercises/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      const { data, error } = await client
        .from("exercises")
        .select("*, exercise_categories(code, name)")
        .eq("id", request.params.id)
        .single();

      if (error || !data) {
        return reply.code(404).send({ message: "Exercice introuvable" });
      }
      return data;
    }
  );

  // GET /api/exercises/categories — pour peupler les filtres du frontend
  app.get("/api/exercises/categories", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);
    const { data, error } = await client
      .from("exercise_categories")
      .select("id, code, name, description")
      .order("display_order");

    if (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Impossible de charger les catégories" });
    }
    return data;
  });
}
