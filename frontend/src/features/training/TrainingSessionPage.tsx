import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession, useCompleteSessionExercise, useCompleteSession } from "@/hooks/useSession";

/**
 * MVP volontairement SANS audio/IA à ce stade (phases 3 et 4 du projet) :
 * l'utilisateur lit la consigne, s'entraîne à voix haute par lui-même,
 * puis s'auto-évalue de 1 à 10. C'est une mesure déclarative, pas une
 * mesure objective — on ne prétend analyser ni le débit ni la voix ici.
 */
export default function TrainingSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading } = useSession(sessionId);
  const completeExercise = useCompleteSessionExercise(sessionId!);
  const completeSession = useCompleteSession();
  const navigate = useNavigate();
  const [rating, setRating] = useState(7);

  if (isLoading || !session) {
    return (
      <AppShell>
        <p className="p-6 text-sm text-brand-900/50">Chargement de la séance…</p>
      </AppShell>
    );
  }

  const items = [...session.session_exercises].sort((a, b) => a.display_order - b.display_order);
  const currentIndex = items.findIndex((i) => !i.completed);
  const current = currentIndex === -1 ? null : items[currentIndex];
  const allDone = currentIndex === -1;

  async function handleValidate() {
    if (!current) return;
    await completeExercise.mutateAsync({ sessionExerciseId: current.id, selfRating: rating });
    setRating(7);
  }

  async function handleFinishSession() {
    await completeSession.mutateAsync(sessionId!);
    navigate("/dashboard");
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-brand-700">Séance du jour</h1>
          <span className="text-xs text-brand-900/50">
            {items.filter((i) => i.completed).length}/{items.length} terminés
          </span>
        </div>

        <div className="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 transition-all"
            style={{ width: `${(items.filter((i) => i.completed).length / items.length) * 100}%` }}
          />
        </div>

        {allDone ? (
          <Card className="text-center space-y-3">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold text-brand-700">Séance terminée !</p>
            <p className="text-sm text-brand-900/60">
              Bravo, vous avez complété les {items.length} exercices du jour.
            </p>
            <Button onClick={handleFinishSession} disabled={completeSession.isPending}>
              Retour au tableau de bord
            </Button>
          </Card>
        ) : (
          current && (
            <Card className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-400 font-medium">
                    {current.exercises.exercise_categories?.name}
                  </p>
                  <h2 className="text-lg font-bold text-brand-700">{current.exercises.title}</h2>
                </div>
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                  {Math.round(current.exercises.duration_sec / 60) || 1} min
                </span>
              </div>

              <ExerciseContent instructions={current.exercises.instructions} content={current.exercises.content} />

              <div>
                <p className="text-xs text-brand-900/60 mb-2">Comment évaluez-vous votre réalisation ?</p>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center text-sm font-medium text-brand-700">{rating}/10</p>
              </div>

              <Button onClick={handleValidate} disabled={completeExercise.isPending} className="w-full">
                {completeExercise.isPending ? "Enregistrement…" : "Valider et continuer"}
              </Button>
            </Card>
          )
        )}
      </div>
    </AppShell>
  );
}

function ExerciseContent({
  instructions,
  content
}: {
  instructions?: string;
  content: Record<string, unknown>;
}) {
  // Le contenu jsonb varie selon la catégorie (virelangue, texte de lecture,
  // sujet d'improvisation, exercice de respiration...). On affiche d'abord
  // la consigne générale (colonne `instructions` de l'exercice), puis les
  // champs spécifiques présents dans `content`.
  const texte = (content.texte as string) ?? (content.phrase as string);
  const sujet = content.sujet as string | undefined;
  const situation = content.situation as string | undefined;
  const objectif = content.objectif as string | undefined;
  const position = content.position as string | undefined;
  const erreur = content.erreur_a_eviter as string | undefined;
  const progression = content.progression as string | undefined;

  return (
    <div className="bg-brand-50 rounded-lg p-4 text-sm text-brand-900/80 leading-relaxed space-y-2">
      {instructions && <p>{instructions}</p>}
      {texte && <p className="font-medium text-brand-700">« {texte} »</p>}
      {sujet && <p className="font-medium text-brand-700">« {sujet} »</p>}
      {situation && <p className="font-medium text-brand-700">{situation}</p>}

      {(objectif || position || erreur || progression) && (
        <dl className="text-xs text-brand-900/60 space-y-1 pt-1 border-t border-brand-100">
          {objectif && (
            <div>
              <dt className="inline font-semibold text-brand-700">Objectif : </dt>
              <dd className="inline">{objectif}</dd>
            </div>
          )}
          {position && (
            <div>
              <dt className="inline font-semibold text-brand-700">Position : </dt>
              <dd className="inline">{position}</dd>
            </div>
          )}
          {erreur && (
            <div>
              <dt className="inline font-semibold text-brand-700">Erreur à éviter : </dt>
              <dd className="inline">{erreur}</dd>
            </div>
          )}
          {progression && (
            <div>
              <dt className="inline font-semibold text-brand-700">Progression : </dt>
              <dd className="inline">{progression}</dd>
            </div>
          )}
        </dl>
      )}

      {!instructions && !texte && !sujet && !situation && !objectif && (
        <p className="text-xs text-brand-900/40">Suivez les indications de l'exercice.</p>
      )}
    </div>
  );
}
