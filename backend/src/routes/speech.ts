import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseForUser } from "../database/supabaseAdmin.js";
import { getSpeechRecognitionService } from "../speech/index.js";
import { getAIService } from "../ai/index.js";
import { computeObjectiveMetrics } from "../speech/objectiveMetrics.js";

const createAttemptSchema = z.object({
  exercise_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
  // Chemin dans le bucket Storage (ex: "{user_id}/{uuid}.webm"), PAS l'audio
  // lui-même : le fichier a déjà été uploadé directement par le frontend
  // vers Supabase Storage (RLS y contrôle l'accès par dossier utilisateur).
  audio_storage_path: z.string().min(1),
  duration_sec: z.number().positive().max(600) // 10 min max par tentative, garde-fou raisonnable
});

/**
 * L'upload binaire de l'audio ne transite JAMAIS par ce backend : le
 * frontend uploade directement vers Supabase Storage avec son propre JWT
 * (RLS restreint chaque utilisateur à son dossier). Ce endpoint se contente
 * d'enregistrer la métadonnée en base une fois l'upload terminé. Évite de
 * faire transiter des fichiers audio (potentiellement volumineux) par notre
 * serveur Render, qui a des limites de taille de requête et de bande passante.
 */
export async function speechRoutes(app: FastifyInstance) {
  app.post("/api/speech/attempts", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = createAttemptSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Payload invalide", errors: parsed.error.flatten() });
    }

    // Garde-fou de sécurité : le chemin doit être dans le dossier de
    // l'utilisateur courant, même si RLS sur Storage le garantit déjà côté
    // fichier — on vérifie aussi côté métadonnée pour éviter qu'un
    // utilisateur enregistre une ligne pointant vers le dossier d'un autre.
    if (!parsed.data.audio_storage_path.startsWith(`${request.userId}/`)) {
      return reply.code(403).send({ message: "Chemin de stockage invalide pour cet utilisateur" });
    }

    const client = supabaseForUser(request.accessToken!);
    const { data, error } = await client
      .from("speech_attempts")
      .insert({
        user_id: request.userId,
        exercise_id: parsed.data.exercise_id ?? null,
        session_id: parsed.data.session_id ?? null,
        audio_storage_path: parsed.data.audio_storage_path,
        duration_sec: parsed.data.duration_sec
      })
      .select()
      .single();

    if (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Impossible d'enregistrer la tentative audio" });
    }

    return data;
  });

  // GET /api/speech/attempts?exercise_id=... — historique des tentatives
  // pour un exercice donné (utile pour comparer plusieurs essais).
  app.get<{ Querystring: { exercise_id?: string } }>(
    "/api/speech/attempts",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      let query = client
        .from("speech_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (request.query.exercise_id) {
        query = query.eq("exercise_id", request.query.exercise_id);
      }

      const { data, error } = await query;
      if (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Impossible de charger l'historique audio" });
      }
      return data;
    }
  );

  // GET /api/speech/attempts/:id/url — génère une URL signée temporaire
  // pour réécouter un enregistrement (le bucket étant privé, aucune URL
  // publique directe n'existe).
  app.get<{ Params: { id: string } }>(
    "/api/speech/attempts/:id/url",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      const { data: attempt, error: attemptError } = await client
        .from("speech_attempts")
        .select("audio_storage_path")
        .eq("id", request.params.id)
        .single();

      if (attemptError || !attempt) {
        return reply.code(404).send({ message: "Tentative introuvable" });
      }

      const { data: signed, error: signError } = await client.storage
        .from("speech-audio")
        .createSignedUrl(attempt.audio_storage_path, 60 * 10); // valide 10 min

      if (signError || !signed) {
        request.log.error(signError);
        return reply.code(500).send({ message: "Impossible de générer l'URL de lecture" });
      }

      return { url: signed.signedUrl };
    }
  );

  // GET /api/speech/attempts/:id/analysis — relit une analyse déjà générée
  // (transcription + mesures + feedback), sans rien recalculer. Utilisé au
  // chargement de la page pour afficher un résultat existant sans le
  // regénérer inutilement (coût IA).
  app.get<{ Params: { id: string } }>(
    "/api/speech/attempts/:id/analysis",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);
      const [{ data: transcription }, { data: metrics }, { data: feedback }] = await Promise.all([
        client.from("transcriptions").select("*").eq("speech_attempt_id", request.params.id).maybeSingle(),
        client.from("objective_metrics").select("*").eq("speech_attempt_id", request.params.id).maybeSingle(),
        client.from("ai_feedback").select("*").eq("speech_attempt_id", request.params.id).maybeSingle()
      ]);

      if (!transcription && !metrics && !feedback) {
        return reply.code(404).send({ message: "Aucune analyse disponible pour cette tentative" });
      }

      return { transcription, objective_metrics: metrics, ai_feedback: feedback };
    }
  );

  // POST /api/speech/attempts/:id/analyze — pipeline complet :
  // audio (Storage) -> transcription -> mesures objectives -> feedback IA.
  //
  // Optimisation coût (voir cahier des charges §39) : si une analyse existe
  // déjà pour cette tentative, on la renvoie telle quelle plutôt que de
  // rappeler Gemini deux fois (transcription + feedback) pour rien. Cette
  // route n'est déclenchée que sur action explicite de l'utilisateur
  // ("Analyser"), jamais automatiquement — l'utilisateur garde le contrôle
  // du coût.
  app.post<{ Params: { id: string } }>(
    "/api/speech/attempts/:id/analyze",
    { preHandler: requireAuth },
    async (request, reply) => {
      const client = supabaseForUser(request.accessToken!);

      const { data: attempt, error: attemptError } = await client
        .from("speech_attempts")
        .select("id, audio_storage_path, duration_sec, exercises(title, target_skill, exercise_categories(name))")
        .eq("id", request.params.id)
        .single();

      if (attemptError || !attempt) {
        return reply.code(404).send({ message: "Tentative introuvable" });
      }

      // Cache : évite de repayer une analyse déjà générée pour cette tentative
      const { data: existingFeedback } = await client
        .from("ai_feedback")
        .select("*")
        .eq("speech_attempt_id", attempt.id)
        .maybeSingle();

      if (existingFeedback) {
        const [{ data: transcription }, { data: metrics }] = await Promise.all([
          client.from("transcriptions").select("*").eq("speech_attempt_id", attempt.id).maybeSingle(),
          client.from("objective_metrics").select("*").eq("speech_attempt_id", attempt.id).maybeSingle()
        ]);
        return { transcription, objective_metrics: metrics, ai_feedback: existingFeedback, cached: true };
      }

      // 1. Télécharger l'audio depuis Storage (le bucket est privé, RLS
      // garantit que cet utilisateur ne peut télécharger que ses propres
      // fichiers — même logique que pour l'URL signée ci-dessus).
      const { data: audioBlob, error: downloadError } = await client.storage
        .from("speech-audio")
        .download(attempt.audio_storage_path);

      if (downloadError || !audioBlob) {
        request.log.error(downloadError);
        return reply.code(500).send({ message: "Impossible de récupérer le fichier audio" });
      }

      const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());
      const audioBase64 = audioBuffer.toString("base64");
      // On normalise vers le type MIME simple attendu par Gemini (sans
      // paramètre codec du type ";codecs=opus" ajouté par MediaRecorder).
      const mimeType = (audioBlob.type || "audio/webm").split(";")[0];

      // 2. Transcription
      let transcriptText: string;
      let wordsCount: number;
      try {
        const speechService = getSpeechRecognitionService();
        const result = await speechService.transcribe(audioBase64, mimeType);
        transcriptText = result.text;
        wordsCount = result.wordsCount;
      } catch (err) {
        request.log.error(err);
        return reply.code(502).send({ message: "Échec de la transcription audio" });
      }

      const { error: transcriptionInsertError } = await client.from("transcriptions").insert({
        speech_attempt_id: attempt.id,
        text: transcriptText,
        words_count: wordsCount,
        provider: "gemini"
      });
      if (transcriptionInsertError) {
        request.log.error(transcriptionInsertError);
        return reply.code(500).send({ message: "Impossible d'enregistrer la transcription" });
      }

      // 3. Mesures objectives (calcul déterministe, pas de jugement IA)
      const metrics = computeObjectiveMetrics(transcriptText, attempt.duration_sec);
      const { data: insertedMetrics, error: metricsError } = await client
        .from("objective_metrics")
        .insert({
          speech_attempt_id: attempt.id,
          words_per_minute: metrics.wordsPerMinute,
          pause_count: metrics.pauseCount,
          pause_total_sec: metrics.pauseTotalSec,
          hesitation_count: metrics.hesitationCount
        })
        .select()
        .single();
      if (metricsError) {
        request.log.error(metricsError);
        return reply.code(500).send({ message: "Impossible d'enregistrer les mesures objectives" });
      }

      // 4. Feedback IA — seulement si la transcription contient réellement
      // quelque chose d'analysable (évite un appel IA inutile sur un
      // enregistrement vide/inaudible, cf. optimisation coût §39).
      const exerciseInfo = Array.isArray(attempt.exercises) ? attempt.exercises[0] : attempt.exercises;
      const categoryInfo = exerciseInfo?.exercise_categories;
      const category = Array.isArray(categoryInfo) ? categoryInfo[0] : categoryInfo;

      if (!transcriptText.trim()) {
        return {
          transcription: { text: transcriptText, words_count: wordsCount },
          objective_metrics: insertedMetrics,
          ai_feedback: null,
          message: "Enregistrement inaudible ou vide : aucune analyse IA générée."
        };
      }

      let feedback;
      try {
        const aiService = getAIService();
        feedback = await aiService.generateFeedback({
          transcript: transcriptText,
          exerciseTitle: exerciseInfo?.title ?? "Exercice",
          exerciseCategory: category?.name ?? "Non catégorisé",
          targetSkill: exerciseInfo?.target_skill ?? null,
          wordsPerMinute: metrics.wordsPerMinute,
          hesitationCount: metrics.hesitationCount,
          durationSec: attempt.duration_sec
        });
      } catch (err) {
        request.log.error(err);
        return reply.code(502).send({ message: "Échec de la génération du feedback IA" });
      }

      const { data: insertedFeedback, error: feedbackError } = await client
        .from("ai_feedback")
        .insert({
          speech_attempt_id: attempt.id,
          scores: feedback.scores,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          advice: feedback.advice,
          model_used: feedback.modelUsed
        })
        .select()
        .single();
      if (feedbackError) {
        request.log.error(feedbackError);
        return reply.code(500).send({ message: "Impossible d'enregistrer le feedback IA" });
      }

      return {
        transcription: { text: transcriptText, words_count: wordsCount },
        objective_metrics: insertedMetrics,
        ai_feedback: insertedFeedback,
        cached: false
      };
    }
  );
}
