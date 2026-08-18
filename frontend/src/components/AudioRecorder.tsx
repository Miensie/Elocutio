import { useEffect, useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSaveSpeechAttempt } from "@/hooks/useSpeechAttempt";
import { useAnalyzeSpeechAttempt } from "@/hooks/useSpeechAnalysis";
import { useAmbientMusicStore } from "@/stores/useAmbientMusicStore";
import { Button } from "@/components/ui/Button";
import { AIFeedbackCard } from "@/components/AIFeedbackCard";

interface AudioRecorderProps {
  exerciseId?: string;
  sessionId?: string;
  /** Notifié une fois l'enregistrement effectivement sauvegardé côté serveur. */
  onSaved?: () => void;
}

/**
 * Enregistrement facultatif, additif au reste de l'exercice (auto-évaluation
 * incluse) : l'utilisateur peut valider un exercice sans jamais enregistrer
 * sa voix. Ce composant ne bloque donc rien du parcours existant.
 */
export function AudioRecorder({ exerciseId, sessionId, onSaved }: AudioRecorderProps) {
  const muteForRecording = useAmbientMusicStore((s) => s.muteForRecording);
  const unmuteAfterRecording = useAmbientMusicStore((s) => s.unmuteAfterRecording);

  const recorder = useAudioRecorder({
    onStart: muteForRecording,
    onStop: () => {
      void unmuteAfterRecording();
    }
  });

  const saveAttempt = useSaveSpeechAttempt();
  const analyzeAttempt = useAnalyzeSpeechAttempt();
  const [savedAttemptId, setSavedAttemptId] = useState<string | null>(null);

  // Filet de sécurité : si le composant est démonté pendant un enregistrement
  // (navigation, changement d'exercice), on s'assure que le micro est bien
  // relâché et que la musique reprend si elle avait été coupée.
  useEffect(() => {
    return () => {
      if (recorder.status === "recording" || recorder.status === "paused") {
        recorder.stop();
        void unmuteAfterRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!recorder.audioBlob) return;
    const saved = await saveAttempt.mutateAsync({
      blob: recorder.audioBlob,
      durationSec: recorder.durationSec,
      exerciseId,
      sessionId
    });
    setSavedAttemptId(saved.id);
    onSaved?.();
  }

  async function handleAnalyze() {
    if (!savedAttemptId) return;
    await analyzeAttempt.mutateAsync(savedAttemptId);
  }

  return (
    <div className="border border-brand-100 rounded-lg p-3 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-900/60">🎙 Enregistrement (facultatif)</span>
        {(recorder.status === "recording" || recorder.status === "paused") && (
          <span className="text-xs font-mono text-brand-700">{formatTime(recorder.durationSec)}</span>
        )}
      </div>

      {recorder.error && <p className="text-xs text-red-600">{recorder.error}</p>}

      {recorder.status === "idle" || recorder.status === "error" ? (
        <Button variant="secondary" onClick={recorder.start} className="w-full text-xs py-1.5">
          Démarrer l'enregistrement
        </Button>
      ) : recorder.status === "requesting" ? (
        <p className="text-xs text-brand-900/50">Demande d'accès au microphone…</p>
      ) : recorder.status === "recording" ? (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={recorder.pause} className="flex-1 text-xs py-1.5">
            ⏸ Pause
          </Button>
          <Button variant="primary" onClick={recorder.stop} className="flex-1 text-xs py-1.5">
            ⏹ Arrêter
          </Button>
        </div>
      ) : recorder.status === "paused" ? (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={recorder.resume} className="flex-1 text-xs py-1.5">
            ▶ Reprendre
          </Button>
          <Button variant="primary" onClick={recorder.stop} className="flex-1 text-xs py-1.5">
            ⏹ Arrêter
          </Button>
        </div>
      ) : recorder.status === "stopped" && recorder.audioUrl ? (
        <div className="space-y-2">
          <audio controls src={recorder.audioUrl} className="w-full h-8" />

          {!savedAttemptId ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  recorder.reset();
                  setSavedAttemptId(null);
                }}
                className="flex-1 text-xs py-1.5"
              >
                🗑 Supprimer
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saveAttempt.isPending}
                className="flex-1 text-xs py-1.5"
              >
                {saveAttempt.isPending ? "Envoi…" : "☁ Sauvegarder"}
              </Button>
            </div>
          ) : !analyzeAttempt.data ? (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-green-700 flex-1">✓ Enregistrement sauvegardé</span>
              <Button
                variant="secondary"
                onClick={handleAnalyze}
                disabled={analyzeAttempt.isPending}
                className="text-xs py-1.5"
              >
                {analyzeAttempt.isPending ? "Analyse en cours…" : "🧠 Analyser"}
              </Button>
            </div>
          ) : (
            <>
              <AIFeedbackCard analysis={analyzeAttempt.data} />
              <Button
                variant="ghost"
                onClick={() => {
                  recorder.reset();
                  setSavedAttemptId(null);
                  analyzeAttempt.reset();
                }}
                className="w-full text-xs py-1.5"
              >
                Nouvel enregistrement
              </Button>
            </>
          )}

          {saveAttempt.isError && (
            <p className="text-xs text-red-600">
              Échec de la sauvegarde : {(saveAttempt.error as Error).message}
            </p>
          )}
          {analyzeAttempt.isError && (
            <p className="text-xs text-red-600">
              Échec de l'analyse : {(analyzeAttempt.error as Error).message}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
