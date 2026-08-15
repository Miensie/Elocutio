import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/hooks/useDashboard";
import { useProfile } from "@/hooks/useProfile";
import { useCreateDailySession } from "@/hooks/useSession";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: profile } = useProfile();
  const createSession = useCreateDailySession();
  const navigate = useNavigate();

  async function handleStartSession() {
    const session = await createSession.mutateAsync();
    navigate(`/training/${session.id}`);
  }

  const settings = Array.isArray(profile?.user_settings) ? profile?.user_settings[0] : profile?.user_settings;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">
            Bonjour{profile?.display_name ? `, ${profile.display_name.split("@")[0]}` : ""} 👋
          </h1>
          <p className="text-brand-900/60 text-sm">
            Objectif : {profile?.objective ?? "à définir"} — {settings?.daily_duration_target_min ?? 15} min/jour,{" "}
            {settings?.frequency_target_per_week ?? 5} jours/semaine
          </p>
        </div>

        <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-brand-900/60">Entraînement du jour</p>
            <p className="text-lg font-semibold text-brand-700">
              Respiration · Échauffement · Articulation · Virelangues · Lecture · Improvisation
            </p>
          </div>
          <Button onClick={handleStartSession} disabled={createSession.isPending} className="shrink-0">
            {createSession.isPending ? "Préparation…" : "Commencer"}
          </Button>
        </Card>

        {isLoading ? (
          <p className="text-sm text-brand-900/50">Chargement des statistiques…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Séries" value={`${dashboard?.current_streak_days ?? 0} jours`} icon="🔥" />
            <StatCard label="Séances" value={dashboard?.total_sessions ?? 0} icon="📅" />
            <StatCard label="Exercices faits" value={dashboard?.completed_exercises ?? 0} icon="✅" />
            <StatCard label="Séances terminées" value={dashboard?.completed_sessions ?? 0} icon="🏁" />
          </div>
        )}

        <Card>
          <h2 className="font-semibold text-brand-700 mb-3">Séances récentes</h2>
          {dashboard?.recent_sessions?.length ? (
            <ul className="divide-y divide-brand-100">
              {dashboard.recent_sessions.map((s) => (
                <li key={s.id} className="py-2 flex justify-between text-sm">
                  <span className="text-brand-900/70">{new Date(s.started_at).toLocaleDateString("fr-FR")}</span>
                  <span className={s.status === "terminee" ? "text-green-700" : "text-brand-900/50"}>
                    {s.status === "terminee" ? "Terminée" : "En cours"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-900/50">Aucune séance pour l'instant — lancez la première ci-dessus.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <Card className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-brand-700">{value}</div>
      <div className="text-xs text-brand-900/60">{label}</div>
    </Card>
  );
}
