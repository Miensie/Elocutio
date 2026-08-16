import { createClient } from "@supabase/supabase-js";

// IMPORTANT : seules les variables préfixées VITE_ sont exposées au frontend
// par Vite. On n'utilise ici QUE l'URL publique et la clé anonyme (anon key),
// jamais la service role key, qui reste exclusivement côté backend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Erreur explicite plutôt qu'un échec silencieux au runtime
  throw new Error(
    "Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. Vérifiez votre fichier .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE plutôt que le flow "implicit" par défaut : les tokens transitent
    // par un paramètre de requête (?code=...) et non par le fragment "#".
    // Important car le frontend utilise HashRouter (URLs en /#/route) pour
    // fonctionner sous GitHub Pages et Capacitor — le flow implicit mettrait
    // le token d'auth dans le même "#" que les routes et casserait les deux.
    flowType: "pkce"
  }
});
