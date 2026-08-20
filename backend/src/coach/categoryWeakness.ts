import type { SupabaseClient } from "@supabase/supabase-js";

export interface CategoryRating {
  code: string;
  averageRating: number; // moyenne des self_rating, échelle 1-10
  count: number;
}

interface SessionExerciseRatingRow {
  self_rating: number | null;
  exercises: { exercise_categories: { code: string } | null } | null;
}

/**
 * Moyenne des auto-évaluations par catégorie d'exercice — sert de base à la
 * génération adaptative de séance (voir routes/sessions.ts). Volontairement
 * distinct du profil vocal IA (coach/voiceProfile.ts, basé sur ai_feedback) :
 * ici on utilise les catégories d'exercices telles quelles (virelangues,
 * lecture, improvisation...), qui correspondent 1:1 à ce qu'on peut
 * effectivement sélectionner pour composer une séance — pas de mapping
 * approximatif entre des taxonomies différentes.
 */
export async function computeCategoryRatings(
  client: SupabaseClient,
  userId: string
): Promise<CategoryRating[]> {
  const { data, error } = await client
    .from("session_exercises")
    .select("self_rating, exercises(exercise_categories(code))")
    .eq("completed", true)
    .not("self_rating", "is", null)
    .limit(300);

  if (error) {
    throw new Error(`Impossible de calculer les notes par catégorie : ${error.message}`);
  }

  const rows = (data ?? []) as unknown as SessionExerciseRatingRow[];
  const byCategory = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    const code = row.exercises?.exercise_categories?.code;
    if (!code || row.self_rating == null) continue;
    const entry = byCategory.get(code) ?? { sum: 0, count: 0 };
    entry.sum += row.self_rating;
    entry.count += 1;
    byCategory.set(code, entry);
  }

  return Array.from(byCategory.entries()).map(([code, v]) => ({
    code,
    averageRating: Math.round((v.sum / v.count) * 10) / 10,
    count: v.count
  }));
}

/**
 * Traduit une note moyenne (1-10) en niveau de difficulté cible. Règle
 * simple et explicable plutôt qu'un modèle complexe : une moyenne élevée
 * pousse vers plus difficile, une moyenne faible vers plus facile.
 */
export function suggestedDifficulty(averageRating: number): "facile" | "intermediaire" | "difficile" {
  if (averageRating < 4) return "facile";
  if (averageRating <= 7) return "intermediaire";
  return "difficile";
}
