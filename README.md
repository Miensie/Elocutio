# Elocutio — Coach vocal IA

Entraîne ta parole. Maîtrise ta voix.

## Structure du projet

```
elocutio/
├── frontend/        Vite + React + TypeScript + Tailwind, PWA installable
├── backend/          Fastify + TypeScript, API REST
├── supabase/
│   ├── migrations/   Schéma SQL versionné
│   └── seed/          Données initiales (exercices, virelangues...)
└── capacitor/          (ajouté en phase 7 — build Android)
```

## État actuel (Phase 2 — MVP en cours)

- ✅ Schéma Supabase complet avec RLS (`supabase/migrations/0001_init.sql`)
- ✅ Seed de 334 exercices issus du manuel (`supabase/seed/0002_seed_exercises.sql`)
- ✅ Backend : auth middleware, routes `profile` (+ onboarding), `exercises`, `sessions` (génération de la séance du jour), `dashboard`
- ✅ Frontend : Login/Signup, Onboarding (4 étapes), Dashboard, Bibliothèque d'exercices, Séance active avec suivi de progression
- ✅ Navigation responsive (sidebar desktop / barre basse mobile), PWA installable
- ⬜ Enregistrement audio, transcription, analyse IA, Coach IA (Phases 3-4)
- ⬜ Gamification (badges, XP), Capacitor/Android (Phases 6-7)

## Déploiement

### 1. Supabase (base de données + auth)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécuter dans l'ordre :
   - `supabase/migrations/0001_init.sql` (schéma + RLS)
   - `supabase/seed/0002_seed_exercises.sql` (334 exercices issus du manuel)
3. Récupérer dans **Project Settings > API** : `Project URL`, `anon public key`, `service_role key`

> Le seed est généré par `supabase/seed/generate_seed.py`, qui lit `supabase/seed/manual_content/`. Pour régénérer : `cd supabase/seed && python3 generate_seed.py`.

### 2. Backend sur Render

1. Créer un nouveau **Web Service** sur [render.com](https://render.com), pointé sur ce repo, dossier racine `backend/`
2. Build command : `npm install && npm run build` — Start command : `npm start`
3. Renseigner les variables d'environnement (voir `backend/.env.example`) :
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN` = `https://votre-username.github.io` (l'origine de votre GitHub Pages — **sans** le `/nom-du-repo/`, l'origine CORS ne contient jamais de chemin)
   - `AI_PROVIDER=gemini`, `GEMINI_API_KEY` (à partir de la Phase 4)
4. Noter l'URL Render générée (ex. `https://elocutio-backend.onrender.com`) — nécessaire à l'étape suivante

### 3. Frontend sur GitHub Pages

Le déploiement est automatisé via `.github/workflows/deploy-frontend.yml` (build + publication à chaque push sur `main`).

**Configuration à faire une seule fois :**

1. Dans **Settings > Pages** du repo, section *Build and deployment* : Source = **GitHub Actions**
2. Dans **Settings > Secrets and variables > Actions**, onglet **Secrets**, ajouter :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` = l'URL Render du backend (ex. `https://elocutio-backend.onrender.com`)
3. (Optionnel) Onglet **Variables**, ajouter `GH_PAGES_BASE` si le nom du repo diffère de ce que vous voulez comme chemin d'URL — sinon le nom du repo est utilisé automatiquement

Ensuite, chaque push sur `main` qui touche `frontend/` déclenche le build et la publication. Le site est servi sur `https://votre-username.github.io/nom-du-repo/`.

**Pourquoi HashRouter ?** GitHub Pages ne peut pas rediriger une route profonde (ex. `/elocutio/dashboard` rafraîchie en F5) vers `index.html` comme le ferait un vrai serveur. Le frontend utilise donc `HashRouter` (URLs en `/#/dashboard`) : la route est gérée entièrement côté client, donc un rafraîchissement fonctionne toujours. C'est aussi la solution standard pour Capacitor (Phase 7), qui charge l'app via `file://`.

### Déploiement local rapide (test avant de push)

```bash
cd frontend
cp .env.example .env   # renseigner vos valeurs
npm install
npm run build
npm run preview        # sert le build de prod sur http://localhost:4173
```



## Variables d'environnement — qui va où

| Variable | Frontend | Backend | Secrète ? |
|---|---|---|---|
| `SUPABASE_URL` | ✅ (`VITE_SUPABASE_URL`) | ✅ | Non |
| `SUPABASE_ANON_KEY` | ✅ (`VITE_SUPABASE_ANON_KEY`) | ✅ | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ jamais | ✅ | **Oui — jamais commit, jamais frontend** |
| `GEMINI_API_KEY` | ❌ jamais | ✅ | **Oui** |
| `API_BASE_URL` | ✅ (`VITE_API_BASE_URL`) | — | Non |
| `VITE_BASE_PATH` | ✅ (build only, CI) | — | Non — sous-chemin de déploiement, ex. `/elocutio/` |
| `CORS_ORIGIN` | — | ✅ | Non — liste d'origines séparées par des virgules |

## Prochaine étape

Phase 3 : enregistrement audio (composant `AudioRecorder`, upload vers Supabase Storage), puis Phase 4 : transcription et premier retour IA via Gemini.
