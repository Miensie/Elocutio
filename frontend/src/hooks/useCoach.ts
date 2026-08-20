import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";

export interface SkillEntry {
  key: string;
  label: string;
  score: number;
  trend: number | null;
  dataPoints: number;
}

export interface VoiceProfile {
  skills: SkillEntry[];
  strengths: SkillEntry[];
  weaknesses: SkillEntry[];
  hasEnoughData: boolean;
  totalDataPoints: number;
}

export interface CoachMessageResponse {
  message: string;
  based_on_data: boolean;
  cached: boolean;
}

/** Calcul déterministe (agrégation SQL), aucun coût IA — peut être rafraîchi librement. */
export function useVoiceProfile() {
  return useQuery({
    queryKey: ["coach-profile"],
    queryFn: () => api.get<VoiceProfile>("/api/coach/profile")
  });
}

/** Message du jour, mis en cache côté serveur (1 appel IA max par jour). */
export function useCoachMessage() {
  return useQuery({
    queryKey: ["coach-message"],
    queryFn: () => api.get<CoachMessageResponse>("/api/coach/message"),
    staleTime: 60 * 60 * 1000 // 1h : pas la peine de revérifier plus souvent, le message ne change qu'une fois par jour côté serveur
  });
}
