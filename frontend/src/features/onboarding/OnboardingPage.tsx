import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUpdateProfile } from "@/hooks/useProfile";

const LEVELS = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
  { value: "expert", label: "Expert" }
] as const;

const OBJECTIVES = [
  "Entretien d'embauche", "Présentation professionnelle", "Études",
  "Leadership / management", "Conversation quotidienne", "Prise de parole en public", "Improvisation"
];

const CONTEXTS = ["Travail", "Études", "Réunions", "Entretiens", "Public / conférences", "Vie quotidienne"];

const FREQUENCIES = [3, 4, 5, 6, 7];

/**
 * Onboarding en 4 étapes courtes. Chaque réponse est envoyée en une seule
 * requête PATCH /api/profile à la fin, pour éviter de multiplier les
 * appels réseau pendant que l'utilisateur navigue entre les étapes.
 */
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"]>("debutant");
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [context, setContext] = useState(CONTEXTS[0]);
  const [frequency, setFrequency] = useState(5);
  const [duration, setDuration] = useState(15);

  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Quel est votre niveau actuel ?",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <OptionButton key={l.value} selected={level === l.value} onClick={() => setLevel(l.value)}>
              {l.label}
            </OptionButton>
          ))}
        </div>
      )
    },
    {
      title: "Quel est votre objectif principal ?",
      content: (
        <div className="grid grid-cols-1 gap-2">
          {OBJECTIVES.map((o) => (
            <OptionButton key={o} selected={objective === o} onClick={() => setObjective(o)}>
              {o}
            </OptionButton>
          ))}
        </div>
      )
    },
    {
      title: "Dans quel contexte parlez-vous le plus souvent ?",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {CONTEXTS.map((c) => (
            <OptionButton key={c} selected={context === c} onClick={() => setContext(c)}>
              {c}
            </OptionButton>
          ))}
        </div>
      )
    },
    {
      title: "Combien de jours par semaine, et combien de minutes par jour ?",
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-brand-900/60 mb-2">Jours par semaine</p>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <OptionButton key={f} selected={frequency === f} onClick={() => setFrequency(f)} className="flex-1">
                  {f}
                </OptionButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-brand-900/60 mb-2">Minutes par jour</p>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-brand-700 font-medium text-center">{duration} min / jour</p>
          </div>
        </div>
      )
    }
  ];

  const isLast = step === steps.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    await updateProfile.mutateAsync({
      level,
      objective,
      speaking_context: context,
      onboarding_completed: true,
      daily_duration_target_min: duration,
      frequency_target_per_week: frequency
    });
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand-400" : "bg-brand-100"}`} />
          ))}
        </div>
        <h1 className="text-lg font-bold text-brand-700 mb-4">{steps[step].title}</h1>
        {steps[step].content}

        {updateProfile.isError && (
          <p className="text-sm text-red-600 mt-3">Une erreur est survenue, réessayez.</p>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Précédent
          </Button>
          <Button onClick={handleNext} disabled={updateProfile.isPending}>
            {isLast ? (updateProfile.isPending ? "Enregistrement…" : "Commencer") : "Suivant"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  className = ""
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm border text-center transition-colors ${
        selected
          ? "bg-brand-700 text-white border-brand-700"
          : "bg-white text-brand-900/80 border-brand-100 hover:border-brand-400"
      } ${className}`}
    >
      {children}
    </button>
  );
}
