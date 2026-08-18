import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import type { SpeechAnalysis } from "@/types/analysis";

/** Relit une analyse déjà générée (si elle existe) sans en déclencher une nouvelle. */
export function useSpeechAnalysis(attemptId: string | undefined) {
  return useQuery({
    queryKey: ["speech-analysis", attemptId],
    queryFn: () => api.get<SpeechAnalysis>(`/api/speech/attempts/${attemptId}/analysis`),
    enabled: !!attemptId,
    retry: false // un 404 signifie juste "pas encore analysé", pas une erreur à réessayer
  });
}

/** Déclenche le pipeline complet (transcription + mesures + feedback IA). */
export function useAnalyzeSpeechAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => api.post<SpeechAnalysis>(`/api/speech/attempts/${attemptId}/analyze`),
    onSuccess: (data, attemptId) => {
      queryClient.setQueryData(["speech-analysis", attemptId], data);
    }
  });
}
