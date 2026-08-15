import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";

const onboardingSchema = z.object({
  level: z.enum(["debutant", "intermediaire", "avance", "expert"]).optional(),
  objective: z.string().min(1).max(100).optional(),
  speaking_context: z.string().min(1).max(100).optional(),
  onboarding_completed: z.boolean().optional(),
  daily_duration_target_min: z.number().int().min(5).max(120).optional(),
  frequency_target_per_week: z.number().int().min(1).max(7).optional()
});

export async function profileRoutes(app: FastifyInstance) {
  // GET /api/profile — lit le profil de l'utilisateur connecté.
  // Utilise un client "scopé utilisateur" : RLS garantit qu'on ne peut
  // récupérer QUE la ligne dont id = auth.uid(), même en cas de bug applicatif.
  app.get("/api/profile", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);
    const { data, error } = await client
      .from("profiles")
      .select("*, user_settings(*)")
      .eq("id", request.userId)
      .single();

    if (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Impossible de charger le profil" });
    }

    return data;
  });

  // PATCH /api/profile — utilisé par l'onboarding puis par les réglages.
  // Sépare volontairement les colonnes de "profiles" et de "user_settings".
  app.patch("/api/profile", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = onboardingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Payload invalide", errors: parsed.error.flatten() });
    }

    const { daily_duration_target_min, frequency_target_per_week, ...profileFields } = parsed.data;
    const client = supabaseForUser(request.accessToken!);

    if (Object.keys(profileFields).length > 0) {
      const { error: profileError } = await client
        .from("profiles")
        .update(profileFields)
        .eq("id", request.userId);
      if (profileError) {
        request.log.error(profileError);
        return reply.code(500).send({ message: "Impossible de mettre à jour le profil" });
      }
    }

    const settingsPatch: Record<string, unknown> = {};
    if (daily_duration_target_min !== undefined) settingsPatch.daily_duration_target_min = daily_duration_target_min;
    if (frequency_target_per_week !== undefined) settingsPatch.frequency_target_per_week = frequency_target_per_week;

    if (Object.keys(settingsPatch).length > 0) {
      const { error: settingsError } = await client
        .from("user_settings")
        .update(settingsPatch)
        .eq("user_id", request.userId);
      if (settingsError) {
        request.log.error(settingsError);
        return reply.code(500).send({ message: "Impossible de mettre à jour les réglages" });
      }
    }

    const { data, error } = await client
      .from("profiles")
      .select("*, user_settings(*)")
      .eq("id", request.userId)
      .single();

    if (error) {
      return reply.code(500).send({ message: "Profil mis à jour mais impossible de le relire" });
    }
    return data;
  });
}

