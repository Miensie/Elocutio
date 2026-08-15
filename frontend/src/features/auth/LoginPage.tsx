import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * L'authentification passe directement par supabase-js côté frontend
 * (pas via notre backend) : c'est le modèle recommandé par Supabase.
 * Le backend se contente ensuite de vérifier le JWT sur chaque requête.
 */
export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Compte créé. Vérifiez votre boîte mail si une confirmation est requise, puis connectez-vous.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!email) {
      setError("Renseignez votre email d'abord, puis cliquez sur « mot de passe oublié »");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setInfo("Email de réinitialisation envoyé si ce compte existe.");
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <Card className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-brand-700 mb-1">Elocutio</h1>
        <p className="text-sm text-brand-900/60 mb-6">
          {mode === "login" ? "Connectez-vous pour continuer" : "Créez votre compte"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-900/70 mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "S'inscrire"}
          </Button>
        </form>

        <div className="flex justify-between mt-4 text-xs">
          <button
            className="text-brand-700 hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Créer un compte" : "J'ai déjà un compte"}
          </button>
          {mode === "login" && (
            <button className="text-brand-900/50 hover:underline" onClick={handlePasswordReset}>
              Mot de passe oublié ?
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
