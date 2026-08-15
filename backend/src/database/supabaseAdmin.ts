import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// Client "admin" : utilise la service role key, contourne RLS.
// Réservé aux opérations serveur légitimes (écrire un feedback IA,
// gérer les exercices en admin, etc.). Ne jamais renvoyer ce client
// ou sa clé au frontend.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

/**
 * Client "scopé utilisateur" : utilise l'anon key mais transmet le JWT
 * de l'utilisateur courant, donc RLS s'applique normalement. À utiliser
 * pour toute lecture/écriture qui doit respecter les policies RLS
 * (ex: lire les propres séances de l'utilisateur).
 */
export function supabaseForUser(accessToken: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}
