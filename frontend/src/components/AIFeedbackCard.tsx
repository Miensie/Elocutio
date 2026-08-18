import type { SpeechAnalysis } from "@/types/analysis";

const SCORE_LABELS: Record<string, string> = {
  fluidite: "Fluidité",
  clarte: "Clarté",
  vocabulaire: "Vocabulaire",
  structure: "Structure"
};

/**
 * Deux blocs visuellement distincts, jamais mélangés : les mesures
 * objectives (débit, hésitations — calcul déterministe sur la transcription)
 * et l'analyse IA (scores, points forts/faibles, conseil — jugement de
 * Gemini). Cette séparation est un principe posé dès l'architecture initiale
 * du projet : ne jamais faire passer une estimation IA pour une mesure.
 */
export function AIFeedbackCard({ analysis }: { analysis: SpeechAnalysis }) {
  const { transcription, objective_metrics, ai_feedback, message } = analysis;

  return (
    <div className="space-y-3">
      {transcription && (
        <div className="bg-brand-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-brand-700 mb-1">Transcription</p>
          <p className="text-sm text-brand-900/80 italic">
            {transcription.text || "(vide ou inaudible)"}
          </p>
        </div>
      )}

      {objective_metrics && (
        <div className="border border-brand-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-brand-700 mb-2">
            Mesures objectives <span className="font-normal text-brand-900/40">(calcul déterministe)</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Metric
              label="Débit"
              value={objective_metrics.words_per_minute ? `${objective_metrics.words_per_minute} mots/min` : "—"}
            />
            <Metric
              label="Hésitations"
              value={objective_metrics.hesitation_count != null ? String(objective_metrics.hesitation_count) : "—"}
            />
          </div>
        </div>
      )}

      {message && (
        <p className="text-xs text-brand-900/50 italic">{message}</p>
      )}

      {ai_feedback && (
        <div className="border border-brand-100 rounded-lg p-3 bg-white">
          <p className="text-xs font-semibold text-brand-700 mb-2">
            Analyse IA <span className="font-normal text-brand-900/40">(estimation, pas une mesure exacte)</span>
          </p>

          <div className="space-y-2 mb-3">
            {Object.entries(ai_feedback.scores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs text-brand-900/70 mb-0.5">
                  <span>{SCORE_LABELS[key] ?? key}</span>
                  <span>{value}/100</span>
                </div>
                <div className="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {ai_feedback.strengths.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-green-700 mb-1">Points forts</p>
              <ul className="text-xs text-brand-900/70 space-y-0.5 list-disc list-inside">
                {ai_feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {ai_feedback.weaknesses.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-amber-700 mb-1">Points à travailler</p>
              <ul className="text-xs text-brand-900/70 space-y-0.5 list-disc list-inside">
                {ai_feedback.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {ai_feedback.advice && (
            <div className="bg-brand-50 rounded p-2 mt-2">
              <p className="text-xs text-brand-900/80">💡 {ai_feedback.advice}</p>
            </div>
          )}

          <p className="text-[10px] text-brand-900/30 mt-2">Généré par {ai_feedback.model_used}</p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-brand-900/50 text-xs">{label}</div>
      <div className="font-medium text-brand-700">{value}</div>
    </div>
  );
}
