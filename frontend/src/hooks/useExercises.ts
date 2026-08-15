import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import type { Exercise, ExerciseCategory } from "@/types/api";

export function useExerciseCategories() {
  return useQuery({
    queryKey: ["exercise-categories"],
    queryFn: () => api.get<ExerciseCategory[]>("/api/exercises/categories")
  });
}

export function useExercises(filters: { category?: string; difficulty?: string }) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  const qs = params.toString();

  return useQuery({
    queryKey: ["exercises", filters],
    queryFn: () => api.get<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ""}`)
  });
}
