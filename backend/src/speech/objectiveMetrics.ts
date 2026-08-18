export interface ObjectiveMetrics {
  wordsPerMinute: number | null;
  hesitationCount: number;
  // Non mesuré dans cette version : nécessiterait une analyse du signal
  // audio (détection de silences), pas seulement du texte transcrit. On
  // documente honnêtement cette limite plutôt que d'inventer une valeur.
  pauseCount: null;
  pauseTotalSec: null;
}

const HESITATION_PATTERN = /\b(euh+|hum+|heu+)\b/gi;

/**
 * Calcule les mesures déterministes à partir d'une transcription et de la
 * durée de l'enregistrement. Aucune de ces valeurs ne provient d'un jugement
 * IA : ce sont des calculs reproductibles sur le texte, clairement
 * distingués du feedback IA (voir ai_feedback vs objective_metrics en base).
 */
export function computeObjectiveMetrics(transcript: string, durationSec: number): ObjectiveMetrics {
  const trimmed = transcript.trim();
  const wordsCount = trimmed.length ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  const wordsPerMinute = durationSec > 0 && wordsCount > 0 ? (wordsCount / durationSec) * 60 : null;

  const hesitationMatches = trimmed.match(HESITATION_PATTERN);
  const hesitationCount = hesitationMatches ? hesitationMatches.length : 0;

  return {
    wordsPerMinute: wordsPerMinute !== null ? Math.round(wordsPerMinute * 10) / 10 : null,
    hesitationCount,
    pauseCount: null,
    pauseTotalSec: null
  };
}
