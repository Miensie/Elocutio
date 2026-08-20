import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";
import { computeVoiceProfile } from "../coach/voiceProfile.js";
import { getAIService } from "../ai/index.js";

const FALLBACK_MESSAGE =
  "Pas encore assez de données pour un message personnalisé : complétez quelques exercices avec " +
  "enregistrement et analyse IA (bouton « Analyser » après un enregistrement) pour débloquer votre " +
  "coaching quotidien.";

export async function coachRoutes(app: FastifyInstance) {
  // GET /api/coach/profile — calcul déterministe, AUCUN coût IA. Peut être
  // appelé aussi souvent que nécessaire sans se soucier du coût.
  app.get("/api/coach/profile", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);
    try {
      const profile = await computeVoiceProfile(client, request.userId!);
      return profile;
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ message: "Impossible de calculer le profil vocal" });
    }
  });

  // GET /api/coach/message — message du jour. Mis en cache en base
  // (contrainte unique user_id+date, voir migration 0004) : un seul appel
  // IA par utilisateur et par jour, quel que soit le nombre de visites.
  app.get("/api/coach/message", { preHandler: requireAuth }, async (request, reply) => {
    const client = supabaseForUser(request.accessToken!);
    const today = new Date().toISOString().slice(0, 10);

    const { data: cached } = await client
      .from("coach_messages")
      .select("*")
      .eq("user_id", request.userId)
      .eq("generated_for_date", today)
      .maybeSingle();

    if (cached) {
      return { message: cached.message, based_on_data: cached.based_on_data, cached: true };
    }

    let profile;
    try {
      profile = await computeVoiceProfile(client, request.userId!);
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ message: "Impossible de calculer le profil vocal" });
    }

    let message: string;
    let basedOnData: boolean;

    if (!profile.hasEnoughData) {
      // Pas d'appel IA si on n'a rien de réel à dire — évite un coût pour
      // un message générique qu'on peut écrire nous-mêmes.
      message = FALLBACK_MESSAGE;
      basedOnData = false;
    } else {
      const { data: profileRow } = await client
        .from("profiles")
        .select("display_name, objective")
        .eq("id", request.userId)
        .single();

      try {
        const aiService = getAIService();
        message = await aiService.generateCoachMessage({
          displayName: profileRow?.display_name ?? null,
          objective: profileRow?.objective ?? null,
          skills: profile.skills.map((s) => ({ label: s.label, score: s.score, trend: s.trend })),
          strengths: profile.strengths.map((s) => s.label),
          weaknesses: profile.weaknesses.map((s) => s.label)
        });
        basedOnData = true;
      } catch (err) {
        request.log.error(err);
        return reply.code(502).send({ message: "Échec de la génération du message du coach" });
      }
    }

    const { data: inserted, error: insertError } = await client
      .from("coach_messages")
      .insert({ user_id: request.userId, message, based_on_data: basedOnData, generated_for_date: today })
      .select()
      .single();

    if (insertError) {
      // Cas de course possible (deux requêtes simultanées le même jour) :
      // la contrainte unique aura rejeté le second insert. On relit alors
      // la ligne existante plutôt que d'échouer.
      const { data: existing } = await client
        .from("coach_messages")
        .select("*")
        .eq("user_id", request.userId)
        .eq("generated_for_date", today)
        .maybeSingle();
      if (existing) {
        return { message: existing.message, based_on_data: existing.based_on_data, cached: true };
      }
      request.log.error(insertError);
      return reply.code(500).send({ message: "Impossible d'enregistrer le message du coach" });
    }

    return { message: inserted.message, based_on_data: inserted.based_on_data, cached: false };
  });
}
