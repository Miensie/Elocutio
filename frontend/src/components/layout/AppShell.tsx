import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAmbientMusicStore } from "@/stores/useAmbientMusicStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Accueil", icon: "🏠" },
  { to: "/exercises", label: "Entraînement", icon: "🎙" },
  { to: "/progress", label: "Progrès", icon: "📈" },
  { to: "/coach", label: "Coach IA", icon: "🧠" },
  { to: "/profile", label: "Profil", icon: "👤" }
];

/**
 * Structure de navigation commune : sidebar sur desktop (md+),
 * barre de navigation basse sur mobile — comme prévu dans le cahier des
 * charges (Accueil / Entraînement / Progrès / IA Coach / Profil).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut);
  const musicEnabled = useAmbientMusicStore((s) => s.enabled);
  const toggleMusic = useAmbientMusicStore((s) => s.toggle);

  return (
    <div className="min-h-screen bg-brand-50 md:flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:border-brand-100 md:bg-white md:p-4">
        <div className="flex items-center justify-between mb-8 px-2">
          <span className="text-xl font-bold text-brand-700">Elocutio</span>
          <MusicToggleButton enabled={musicEnabled} onClick={toggleMusic} />
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-brand-700 text-white" : "text-brand-900/70 hover:bg-brand-50"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="text-xs text-brand-900/50 hover:underline px-2 text-left">
          Se déconnecter
        </button>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* Toggle musique flottant sur mobile (pas de sidebar pour l'accueillir) */}
        <div className="md:hidden fixed top-3 right-3 z-10">
          <MusicToggleButton enabled={musicEnabled} onClick={toggleMusic} />
        </div>
        {children}
      </main>

      {/* Navigation basse mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-brand-100 flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs gap-0.5 px-3 py-1 ${
                isActive ? "text-brand-700 font-medium" : "text-brand-900/50"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function MusicToggleButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={enabled ? "Couper la musique d'ambiance" : "Activer la musique d'ambiance"}
      aria-pressed={enabled}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
        enabled ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-700"
      }`}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
