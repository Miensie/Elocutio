import type { SupabaseClient } from "@supabase/supabase-js";

export interface SkillEntry {
  key: string;
  label: string;
  score: number; // 0-100, moyenne sur les données disponibles
  /** delta vs la période précédente (7 jours vs 7 jours d'avant), null si pas assez de recul */
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

const SKILL_LABELS: Record<string, string> = {
  fluidite: "Fluidité",
  clarte: "Clarté",
  vocabulaire: "Vocabulaire",
  structure: "Structure"
};

const MIN_DATA_POINTS_FOR_PROFILE = 3;

interface ProgressRow {
  skill: string;
  score: number;
  recorded_at: string;
}

/**
 * Calcule le profil vocal à partir de la table `progress`, elle-même
 * peuplée automatiquement à chaque analyse IA d'un enregistrement (voir
 * routes/speech.ts). Ce calcul est un simple agrégat SQL/JS déterministe —
 * il ne coûte AUCUN appel IA, contrairement au message de coaching en
 * langage naturel qui, lui, en fait un (voir generateCoachMessage).
 */
export async function computeVoiceProfile(
  client: SupabaseClient,
  userId: string
): Promise<VoiceProfile> {
  const since = new Date();
  since.setDate(since.getDate() - 90); // fenêtre glissante de 90 jours

  const { data, error } = await client
    .from("progress")
    .select("skill, score, recorded_at")
    .eq("user_id", userId)
    .gte("recorded_at", since.toISOString())
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger la progression : ${error.message}`);
  }

  const rows = (data ?? []) as ProgressRow[];
  const bySkill = new Map<string, ProgressRow[]>();
  for (const row of rows) {
    const list = bySkill.get(row.skill) ?? [];
    list.push(row);
    bySkill.set(row.skill, list);
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const skills: SkillEntry[] = Array.from(bySkill.entries()).map(([skill, entries]) => {
    const avg = (list: ProgressRow[]) => list.reduce((sum, r) => sum + r.score, 0) / list.length;

    const recent = entries.filter((r) => now - new Date(r.recorded_at).getTime() <= sevenDaysMs);
    const previous = entries.filter((r) => {
      const age = now - new Date(r.recorded_at).getTime();
      return age > sevenDaysMs && age <= 2 * sevenDaysMs;
    });

    const trend = recent.length > 0 && previous.length > 0 ? Math.round(avg(recent) - avg(previous)) : null;

    return {
      key: skill,
      label: SKILL_LABELS[skill] ?? skill,
      score: Math.round(avg(entries) * 10) / 10,
      trend,
      dataPoints: entries.length
    };
  });

  skills.sort((a, b) => b.score - a.score);

  return {
    skills,
    strengths: skills.slice(0, 2),
    weaknesses: skills.slice(-2).reverse(),
    hasEnoughData: rows.length >= MIN_DATA_POINTS_FOR_PROFILE,
    totalDataPoints: rows.length
  };
}
