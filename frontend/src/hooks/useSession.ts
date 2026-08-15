import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import type { TrainingSession } from "@/types/api";

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.get<TrainingSession>(`/api/sessions/${sessionId}`),
    enabled: !!sessionId
  });
}

export function useCreateDailySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<TrainingSession>("/api/sessions"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useCompleteSessionExercise(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionExerciseId, selfRating }: { sessionExerciseId: string; selfRating?: number }) =>
      api.patch(`/api/sessions/${sessionId}/exercises/${sessionExerciseId}`, { self_rating: selfRating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    }
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.patch(`/api/sessions/${sessionId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
