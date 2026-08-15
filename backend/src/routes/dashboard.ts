import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";

export async function dashboardRoutes(app: FastifyInstance) {
  // GET /api/dashboard — agrège les statistiques MVP (sans IA pour l'instant :
  // ces chiffres viennent uniquement de mesures déterministes sur les
  // séances/exercices complétés, pas d'un score IA).
  app.get("/api/dashboard", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);

    const { data: sessions, error: sessionsError } = await client
      .from("sessions")
      .select("id, started_at, ended_at, status")
      .order("started_at", { ascending: false })
      .limit(60);

    if (sessionsError) {
      request.log.error(sessionsError);
      return reply.code(500).send({ message: "Impossible de charger le tableau de bord" });
    }

    const { count: completedExercisesCount } = await client
      .from("session_exercises")
      .select("id", { count: "exact", head: true })
      .eq("completed", true);

    const totalSessions = sessions?.length ?? 0;
    const completedSessions = sessions?.filter((s) => s.status === "terminee").length ?? 0;

    // Série de jours consécutifs avec au moins une séance terminée
    const daysWithSession = new Set(
      (sessions ?? [])
        .filter((s) => s.status === "terminee")
        .map((s) => new Date(s.started_at).toISOString().slice(0, 10))
    );
    let streak = 0;
    const cursor = new Date();
    while (daysWithSession.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      completed_exercises: completedExercisesCount ?? 0,
      current_streak_days: streak,
      recent_sessions: sessions?.slice(0, 10) ?? []
    };
  });
}
