import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import { uploadAudioBlob } from "@/services/audioStorage";

interface SaveAttemptInput {
  blob: Blob;
  durationSec: number;
  exerciseId?: string;
  sessionId?: string;
}

interface SpeechAttempt {
  id: string;
  audio_storage_path: string;
  duration_sec: number;
  created_at: string;
}

/**
 * Deux étapes : upload direct du binaire vers Supabase Storage, puis
 * enregistrement de la métadonnée via le backend (voir audioStorage.ts et
 * routes/speech.ts pour le raisonnement sur cette séparation).
 */
export function useSaveSpeechAttempt() {
  return useMutation({
    mutationFn: async ({ blob, durationSec, exerciseId, sessionId }: SaveAttemptInput) => {
      const path = await uploadAudioBlob(blob);
      return api.post<SpeechAttempt>("/api/speech/attempts", {
        audio_storage_path: path,
        duration_sec: Math.round(durationSec),
        exercise_id: exerciseId,
        session_id: sessionId
      });
    }
  });
}
