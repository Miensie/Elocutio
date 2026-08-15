import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";

interface AuthState {
  session: Session | null;
  loading: boolean;
  init: () => void;
  signOut: () => Promise<void>;
}

/**
 * Source de vérité unique pour l'état d'authentification côté frontend.
 * `init()` s'abonne aux changements de session Supabase (login, logout,
 * refresh token) pour que toute l'app reste synchronisée automatiquement.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, loading: false });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, loading: false });
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  }
}));
