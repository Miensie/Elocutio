import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";

interface SessionExerciseRow {
  self_rating: number | null;
  completed_at: string | null;
  exercises: { exercise_categories: { code: string; name: string } | null } | null;
}

/**
 * GET /api/progress — agrège les auto-évaluations (self_rating, 1-10) par
 * catégorie d'exercice. C'est une mesure DÉCLARATIVE (l'utilisateur note
 * lui-même sa réalisation), pas une mesure objective ni un score IA : le
 * frontend doit rester honnête sur cette distinction (voir Module 14 du
 * cahier des charges). Les scores par compétence issus de l'analyse audio/IA
 * arriveront en Phase 4 et viendront compléter, pas remplacer, cette vue.
 */
export async function progressRoutes(app: FastifyInstance) {
  app.get("/api/progress", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);

    const { data, error } = await client
      .from("session_exercises")
      .select("self_rating, completed_at, exercises(exercise_categories(code, name))")
      .eq("completed", true)
      .not("self_rating", "is", null)
      .order("completed_at", { ascending: false })
      .limit(500);

    if (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Impossible de charger la progression" });
    }

    const rows = (data ?? []) as unknown as SessionExerciseRow[];

    const byCategory = new Map<string, { name: string; sum: number; count: number }>();
    for (const row of rows) {
      const category = row.exercises?.exercise_categories;
      if (!category || row.self_rating == null) continue;
      const entry = byCategory.get(category.code) ?? { name: category.name, sum: 0, count: 0 };
      entry.sum += row.self_rating;
      entry.count += 1;
      byCategory.set(category.code, entry);
    }

    const categories = Array.from(byCategory.entries()).map(([code, v]) => ({
      code,
      name: v.name,
      average_rating: Math.round((v.sum / v.count) * 10) / 10,
      exercises_count: v.count
    }));

    return {
      categories,
      total_rated_exercises: rows.length,
      recent: rows.slice(0, 15).map((r) => ({
        self_rating: r.self_rating,
        completed_at: r.completed_at,
        category: r.exercises?.exercise_categories?.name ?? null
      }))
    };
  });
}
