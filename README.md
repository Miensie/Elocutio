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

## État actuel (Phase 5 terminée)

- ✅ Schéma Supabase complet avec RLS (`supabase/migrations/0001_init.sql` à `0005_progress_insert_policy.sql`)
- ✅ Seed de 334 exercices issus du manuel (`supabase/seed/0002_seed_exercises.sql`)
- ✅ Bucket Storage privé pour l'audio + RLS par dossier utilisateur
- ✅ Backend : auth, `profile`, `exercises`, `sessions` (adaptatives), `dashboard`, `progress`, `speech` (upload/analyse/feedback), `coach` (profil vocal + message du jour)
- ✅ Frontend : Login/Signup, Onboarding, Dashboard, Bibliothèque, Séance active, Progrès, **Coach IA**, Profil
- ✅ Enregistrement audio + pipeline IA complet (transcription → mesures objectives → feedback structuré)
- ✅ Musique d'ambiance générée par synthèse, coupée pendant l'enregistrement
- ✅ **Personnalisation (Phase 5)** :
  - Génération de séance adaptative : un exercice supplémentaire dans la catégorie la plus faible de l'utilisateur (basé sur ses auto-évaluations), difficulté ajustée automatiquement — calcul déterministe, sans coût IA (`coach/categoryWeakness.ts`)
  - Profil vocal (barres de compétences + tendances 7 jours) calculé à partir de l'historique des analyses IA — calcul pur, sans nouvel appel IA (`coach/voiceProfile.ts`)
  - Message de coaching quotidien en langage naturel, généré par Gemini **une seule fois par jour** et mis en cache en base (contrainte unique `user_id + date`, testée avec succès sur PostgreSQL réel)
- ✅ Navigation responsive (5 onglets), PWA installable avec icônes réelles
- ⬜ Simulateur d'entretien conversationnel, gamification (Phase 6)
- ⬜ Capacitor/Android (Phase 7)

## Déploiement

### 1. Supabase (base de données + auth)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécuter dans l'ordre :
   - `supabase/migrations/0001_init.sql` (schéma + RLS)
   - `supabase/seed/0002_seed_exercises.sql` (334 exercices issus du manuel)
   - `supabase/migrations/0003_storage.sql` (bucket audio privé + RLS)
   - `supabase/migrations/0004_coach_messages.sql` (cache des messages du coach)
   - `supabase/migrations/0005_progress_insert_policy.sql` (policy manquante, nécessaire à la Phase 5)
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

Phase 6 : gamification (XP, niveaux, badges, séries) — les données nécessaires (streak déjà calculé, exercices complétés, scores) sont déjà en base, il s'agit surtout de traduire ça en système de récompense visible. En parallèle, Phase 5 pourrait être enrichie d'un simulateur d'entretien conversationnel multi-tours (mode "Entretien" du cahier des charges initial), qui réutiliserait `AIService` avec une nouvelle méthode dédiée.

## Notes techniques Phase 4 (IA)

- **SDK** : `@google/genai` (le SDK actuel de Google, pas l'ancien `@google/generative-ai` déprécié). Modèle configurable via `GEMINI_MODEL` (défaut `gemini-2.5-flash`) — vérifiez le nom courant sur [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) si besoin, les noms de modèles Gemini changent fréquemment.
- **Format audio** : le pipeline envoie `audio/webm` (format par défaut de `MediaRecorder` sur Chrome/Firefox/Android) directement à Gemini, sans transcodage. Si vous rencontrez une erreur de format en production, transcoder côté serveur (ex. ffmpeg vers `audio/ogg`) est la solution de repli.
- **Coût** : l'analyse (transcription + feedback, 2 appels Gemini) n'est déclenchée que sur clic explicite "Analyser", jamais automatiquement. Les résultats sont mis en cache en base : ré-visiter une tentative déjà analysée ne réappelle jamais l'IA.
- **Honnêteté des mesures** : `objective_metrics` (débit, hésitations) est un calcul déterministe sur la transcription, distinct de `ai_feedback` (scores/conseils, jugement du modèle) — jamais mélangés, ni en base ni dans l'UI. La détection de pauses (silences) n'est pas implémentée : nécessiterait une analyse du signal audio, pas seulement du texte.

## Notes techniques Phase 5 (personnalisation)

- **Deux taxonomies distinctes, jamais mélangées** : la génération de séance adaptative se base sur les catégories d'exercices (virelangues, lecture...) via les auto-évaluations, tandis que le profil vocal du Coach IA se base sur les compétences transversales (fluidité, clarté...) via les scores IA. Un mapping approximatif entre les deux aurait été trompeur — elles restent séparées intentionnellement.
- **Coût maîtrisé à deux niveaux** : le profil vocal et l'adaptation de séance sont des calculs déterministes (aucun appel IA). Seul le message de coaching quotidien appelle Gemini, et la contrainte unique `(user_id, generated_for_date)` en base garantit qu'il n'est jamais généré plus d'une fois par jour, même en cas de bug applicatif ou de requêtes concurrentes (testé).
- **Bug RLS détecté pendant le développement** : la table `progress` n'avait qu'une policy `SELECT` depuis la Phase 1 (rien n'y écrivait encore à l'époque). L'ajout de l'écriture automatique en Phase 5 aurait échoué silencieusement sans la policy `INSERT` ajoutée en `0005_progress_insert_policy.sql` — testé explicitement en local (insert refusé pour un `user_id` non correspondant, accepté sinon).
- **Bug UI détecté et corrigé** : le composant `Card` imposait `bg-white` en dur, ce qui entrait en conflit imprévisible avec toute couleur de fond personnalisée passée en `className` (la carte "Message du jour" du Coach IA était illisible — texte blanc sur fond resté blanc). Corrigé en rendant `bg-white` conditionnel à l'absence d'une classe `bg-*` personnalisée.

