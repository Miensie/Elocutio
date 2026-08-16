import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/useAuthStore";

const LEVELS = ["debutant", "intermediaire", "avance", "expert"] as const;

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const signOut = useAuthStore((s) => s.signOut);
  const session = useAuthStore((s) => s.session);

  const [objective, setObjective] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("debutant");
  const [duration, setDuration] = useState(15);
  const [frequency, setFrequency] = useState(5);
  const [saved, setSaved] = useState(false);

  const settings = Array.isArray(profile?.user_settings) ? profile?.user_settings[0] : profile?.user_settings;

  // Synchronise les champs éditables une fois le profil chargé
  useEffect(() => {
    if (!profile) return;
    setObjective(profile.objective ?? "");
    setLevel(profile.level ?? "debutant");
    if (settings) {
      setDuration(settings.daily_duration_target_min);
      setFrequency(settings.frequency_target_per_week);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleSave() {
    setSaved(false);
    await updateProfile.mutateAsync({
      objective,
      level,
      daily_duration_target_min: duration,
      frequency_target_per_week: frequency
    });
    setSaved(true);
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="p-6 text-sm text-brand-900/50">Chargement du profil…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-brand-700">Profil</h1>

        <Card>
          <p className="text-xs text-brand-900/50 mb-1">Compte</p>
          <p className="text-sm font-medium text-brand-700">{session?.user.email}</p>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1">Objectif principal</label>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1">Niveau</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
              className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1">
              Durée quotidienne cible : {duration} min
            </label>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1">
              Fréquence cible : {frequency} jours/semaine
            </label>
            <input
              type="range"
              min={1}
              max={7}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
            {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </Card>

        <Card>
          <Button variant="ghost" onClick={signOut} className="w-full text-red-600">
            Se déconnecter
          </Button>
        </Card>
      </div>

      {saved && <Toast message="Profil mis à jour" variant="success" onClose={() => setSaved(false)} />}
      {updateProfile.isError && (
        <Toast message="Impossible d'enregistrer les modifications" variant="error" onClose={() => {}} />
      )}
    </AppShell>
  );
}
