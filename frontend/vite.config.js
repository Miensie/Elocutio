import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
// Config Vite : React + PWA installable (desktop + Android)
//
// `base` doit correspondre au sous-chemin sous lequel le site est servi.
// - En local / sur Render / Vercel : "/" (racine)
// - Sur GitHub Pages (projet, pas domaine custom) : "/nom-du-repo/"
// Défini via la variable d'environnement VITE_BASE_PATH au moment du build
// (voir .github/workflows/deploy-frontend.yml), jamais codé en dur ici.
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    var base = env.VITE_BASE_PATH || "/";
    return {
        base: base,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        plugins: [
            react(),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["favicon.svg", "apple-touch-icon.png"],
                manifest: {
                    name: "Elocutio — Coach vocal",
                    short_name: "Elocutio",
                    description: "Entraîne ta parole. Maîtrise ta voix.",
                    theme_color: "#4a3f30",
                    background_color: "#f5efe4",
                    display: "standalone",
                    // Chemins RELATIFS (pas de "/" en tête) : le manifest reste valide
                    // quel que soit le sous-chemin de déploiement (racine ou GitHub Pages).
                    start_url: ".",
                    scope: ".",
                    icons: [
                        { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
                        { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
                        { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
                    ]
                },
                workbox: {
                    // Les exercices statiques (virelangues, textes) doivent rester
                    // accessibles hors ligne : on les met en cache "network first"
                    // avec repli sur le cache.
                    runtimeCaching: [
                        {
                            urlPattern: /\/api\/exercises/,
                            handler: "NetworkFirst",
                            options: { cacheName: "exercises-cache", expiration: { maxEntries: 200 } }
                        }
                    ]
                }
            })
        ],
        server: {
            port: 5173
        }
    };
});
