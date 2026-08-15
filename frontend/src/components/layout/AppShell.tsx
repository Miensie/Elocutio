import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Accueil", icon: "🏠" },
  { to: "/exercises", label: "Entraînement", icon: "🎙" },
  { to: "/progress", label: "Progrès", icon: "📈" },
  { to: "/profile", label: "Profil", icon: "👤" }
];

/**
 * Structure de navigation commune : sidebar sur desktop (md+),
 * barre de navigation basse sur mobile — comme prévu dans le cahier des
 * charges (Accueil / Entraînement / Progrès / IA Coach / Profil).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="min-h-screen bg-brand-50 md:flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:border-brand-100 md:bg-white md:p-4">
        <div className="text-xl font-bold text-brand-700 mb-8 px-2">Elocutio</div>
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
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

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
