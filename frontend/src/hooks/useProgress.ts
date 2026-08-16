import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";

export interface ProgressCategory {
  code: string;
  name: string;
  average_rating: number;
  exercises_count: number;
}

export interface ProgressData {
  categories: ProgressCategory[];
  total_rated_exercises: number;
  recent: { self_rating: number; completed_at: string | null; category: string | null }[];
}

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => api.get<ProgressData>("/api/progress")
  });
}
