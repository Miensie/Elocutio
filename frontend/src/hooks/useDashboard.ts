import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import type { DashboardData } from "@/types/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard")
  });
}
