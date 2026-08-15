import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import type { Profile } from "@/types/api";

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/api/profile"),
    enabled
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile> & { daily_duration_target_min?: number; frequency_target_per_week?: number }) =>
      api.patch<Profile>("/api/profile", patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
}
