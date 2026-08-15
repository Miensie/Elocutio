import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1
    }
  }
});

// HashRouter (URLs du type /#/dashboard) plutôt que BrowserRouter :
// GitHub Pages n'a pas de serveur capable de rediriger une route profonde
// (ex: /elocutio/dashboard rafraîchie en F5) vers index.html. HashRouter
// élimine ce problème car tout se joue côté client après le "#". C'est
// aussi le choix standard pour les apps Capacitor (chargées en file://),
// donc ça sert directement la Phase 7 (Android).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

