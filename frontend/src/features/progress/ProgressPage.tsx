import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useProgress } from "@/hooks/useProgress";
import { useDashboard } from "@/hooks/useDashboard";

/**
 * IMPORTANT (transparence vis-à-vis de l'utilisateur, voir Module 14 du
 * cahier des charges) : tant que la Phase 4 (audio + IA) n'est pas en place,
 * cette page ne peut afficher que des mesures DÉCLARATIVES — les notes que
 * l'utilisateur s'attribue lui-même après chaque exercice (self_rating).
 * Ce n'est ni une mesure objective (débit, pauses...) ni un score IA. On
 * l'affiche donc explicitement comme "auto-évaluation", jamais comme un
 * score de compétence mesuré.
 */
export default function ProgressPage() {
  const { data: progress, isLoading } = useProgress();
  const { data: dashboard } = useDashboard();

  const chartData =
    progress?.categories.map((c) => ({ name: c.name, note: c.average_rating })) ?? [];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Progrès</h1>
          <p className="text-sm text-brand-900/60">
            Auto-évaluations moyennes par catégorie (notes que vous vous attribuez après chaque
            exercice, sur 10).
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-lg font-bold text-brand-700">{dashboard?.current_streak_days ?? 0}</div>
            <div className="text-xs text-brand-900/60">jours de série</div>
          </Card>
          <Card className="text-center">
            <div className="text-lg font-bold text-brand-700">{dashboard?.completed_exercises ?? 0}</div>
            <div className="text-xs text-brand-900/60">exercices faits</div>
          </Card>
          <Card className="text-center">
            <div className="text-lg font-bold text-brand-700">{progress?.total_rated_exercises ?? 0}</div>
            <div className="text-xs text-brand-900/60">auto-évaluations</div>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-brand-700 mb-4">Moyenne par catégorie</h2>
          {isLoading ? (
            <p className="text-sm text-brand-900/50">Chargement…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-brand-900/50">
              Pas encore assez de données. Complétez quelques exercices avec une auto-évaluation
              pour voir apparaître votre progression ici.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8e0cd" />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(value: number) => [`${value}/10`, "Note moyenne"]} />
                  <Bar dataKey="note" fill="#b08d57" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-brand-700 mb-3">Exercices récents notés</h2>
          {progress?.recent?.length ? (
            <ul className="divide-y divide-brand-100">
              {progress.recent.map((r, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span className="text-brand-900/70">{r.category ?? "—"}</span>
                  <span className="text-brand-700 font-medium">{r.self_rating}/10</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-900/50">Aucune auto-évaluation pour l'instant.</p>
          )}
        </Card>

        <div className="text-xs text-brand-900/40 text-center">
          Les scores détaillés par compétence (diction, débit, fluidité…) issus de l'analyse audio
          arriveront avec l'enregistrement vocal, à venir prochainement.
        </div>
      </div>
    </AppShell>
  );
}
