import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useVoiceProfile, useCoachMessage } from "@/hooks/useCoach";

/**
 * Distinction maintenue partout dans l'app : le profil vocal (barres) est un
 * calcul déterministe sur les scores IA déjà obtenus lors des analyses
 * d'enregistrements — pas un nouveau jugement. Seul le message du jour est
 * réellement généré par l'IA (et mis en cache, voir hooks/useCoach.ts).
 */
export default function CoachPage() {
  const { data: profile, isLoading: profileLoading } = useVoiceProfile();
  const { data: coachMessage, isLoading: messageLoading } = useCoachMessage();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Coach IA</h1>
          <p className="text-sm text-brand-900/60">
            Votre profil vocal, calculé à partir de vos enregistrements analysés.
          </p>
        </div>

        <Card className="bg-brand-700 text-white">
          <p className="text-xs uppercase tracking-wide text-brand-100/70 mb-2">Message du jour</p>
          {messageLoading ? (
            <p className="text-sm text-white/70">Préparation de votre message…</p>
          ) : (
            <p className="text-sm leading-relaxed">{coachMessage?.message}</p>
          )}
        </Card>

        {profileLoading ? (
          <p className="text-sm text-brand-900/50">Chargement du profil vocal…</p>
        ) : !profile?.hasEnoughData ? (
          <Card>
            <p className="text-sm text-brand-900/70">
              Votre profil vocal se construit au fil de vos enregistrements analysés par IA
              ({profile?.totalDataPoints ?? 0}/3 minimum). Enregistrez-vous pendant un exercice, puis
              cliquez sur « Analyser » pour commencer à débloquer cette page.
            </p>
          </Card>
        ) : (
          <>
            <Card>
              <h2 className="font-semibold text-brand-700 mb-4">Profil vocal</h2>
              <div className="space-y-4">
                {profile.skills.map((skill) => (
                  <div key={skill.key}>
                    <ProgressBar value={skill.score} label={skill.label} />
                    {skill.trend != null && (
                      <p
                        className={`text-xs mt-0.5 ${
                          skill.trend > 0 ? "text-green-700" : skill.trend < 0 ? "text-amber-700" : "text-brand-900/40"
                        }`}
                      >
                        {skill.trend > 0 ? "▲" : skill.trend < 0 ? "▼" : "–"} {Math.abs(skill.trend)} pts vs
                        semaine précédente
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <p className="text-xs font-medium text-green-700 mb-2">Points forts</p>
                <ul className="space-y-1">
                  {profile.strengths.map((s) => (
                    <li key={s.key} className="text-sm text-brand-900/80">
                      {s.label} — {s.score}/100
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <p className="text-xs font-medium text-amber-700 mb-2">Priorités</p>
                <ul className="space-y-1">
                  {profile.weaknesses.map((s) => (
                    <li key={s.key} className="text-sm text-brand-900/80">
                      {s.label} — {s.score}/100
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <p className="text-xs text-brand-900/40 text-center">
              Basé sur {profile.totalDataPoints} points de données des 90 derniers jours. Votre séance
              du jour est automatiquement ajustée vers vos catégories les moins bien notées.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
