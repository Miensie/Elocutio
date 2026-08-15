-- ============================================================================
-- ELOCUTIO — Migration initiale
-- Schéma complet : profils, exercices, séances, audio, IA, progression,
-- gamification, abonnements. RLS activée sur toutes les tables utilisateur.
-- ============================================================================

-- Extension nécessaire pour les UUID générés côté DB
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES — 1-1 avec auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    level text check (level in ('debutant', 'intermediaire', 'avance', 'expert')) default 'debutant',
    objective text, -- ex: 'entretien', 'presentation', 'confiance', 'improvisation'
    speaking_context text, -- ex: 'travail', 'etudes', 'leadership', 'conversation'
    onboarding_completed boolean not null default false,
    is_admin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.user_settings (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    daily_duration_target_min int not null default 15,
    frequency_target_per_week int not null default 5,
    theme text check (theme in ('light', 'dark', 'system')) default 'system',
    notifications_enabled boolean not null default true,
    updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. EXERCICES — contenu public, en lecture pour tous les utilisateurs connectés
-- ----------------------------------------------------------------------------
create table public.exercise_categories (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null, -- ex: 'virelangues', 'respiration', 'lecture'
    name text not null,
    description text,
    display_order int not null default 0
);

create table public.exercises (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid not null references public.exercise_categories(id) on delete restrict,
    title text not null,
    difficulty text check (difficulty in ('facile', 'intermediaire', 'difficile', 'expert')) not null,
    duration_sec int not null default 60,
    instructions text not null,
    content jsonb not null default '{}'::jsonb, -- texte, virelangue, sujet d'impro, etc.
    target_skill text, -- ex: 'articulation_R', 'debit', 'improvisation'
    metadata jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index idx_exercises_category on public.exercises(category_id);
create index idx_exercises_difficulty on public.exercises(difficulty);
create index idx_exercises_target_skill on public.exercises(target_skill);

-- ----------------------------------------------------------------------------
-- 3. SÉANCES
-- ----------------------------------------------------------------------------
create table public.sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    type text check (type in ('quotidienne', 'libre', 'test_initial', 'test_final')) default 'quotidienne',
    planned_duration_min int,
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    status text check (status in ('en_cours', 'terminee', 'abandonnee')) default 'en_cours'
);

create index idx_sessions_user on public.sessions(user_id, started_at desc);

create table public.session_exercises (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references public.sessions(id) on delete cascade,
    exercise_id uuid not null references public.exercises(id) on delete restrict,
    display_order int not null default 0,
    completed boolean not null default false,
    self_rating int check (self_rating between 1 and 10),
    completed_at timestamptz
);

create index idx_session_exercises_session on public.session_exercises(session_id);

-- ----------------------------------------------------------------------------
-- 4. AUDIO / SPEECH / IA
-- ----------------------------------------------------------------------------
create table public.speech_attempts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    exercise_id uuid references public.exercises(id) on delete set null,
    session_id uuid references public.sessions(id) on delete set null,
    audio_storage_path text, -- chemin dans Supabase Storage, pas l'audio lui-même
    duration_sec numeric,
    created_at timestamptz not null default now()
);

create index idx_speech_attempts_user on public.speech_attempts(user_id, created_at desc);

create table public.transcriptions (
    id uuid primary key default uuid_generate_v4(),
    speech_attempt_id uuid not null references public.speech_attempts(id) on delete cascade,
    text text not null,
    words_count int,
    provider text, -- ex: 'web_speech', 'gemini_stt', 'whisper'
    created_at timestamptz not null default now()
);

-- Mesures OBJECTIVES (calcul déterministe, pas de jugement IA)
create table public.objective_metrics (
    id uuid primary key default uuid_generate_v4(),
    speech_attempt_id uuid not null references public.speech_attempts(id) on delete cascade,
    words_per_minute numeric,
    pause_count int,
    pause_total_sec numeric,
    hesitation_count int, -- détection de "euh"/"hum" par pattern sur la transcription
    created_at timestamptz not null default now()
);

-- Feedback IA (jugement/analyse, clairement distinct des mesures objectives)
create table public.ai_feedback (
    id uuid primary key default uuid_generate_v4(),
    speech_attempt_id uuid not null references public.speech_attempts(id) on delete cascade,
    scores jsonb not null default '{}'::jsonb, -- {diction: 82, fluidite: 71, ...}
    strengths text[],
    weaknesses text[],
    advice text,
    next_exercise_suggestion uuid references public.exercises(id) on delete set null,
    model_used text, -- ex: 'gemini-2.5-flash'
    created_at timestamptz not null default now()
);

create index idx_ai_feedback_attempt on public.ai_feedback(speech_attempt_id);

-- ----------------------------------------------------------------------------
-- 5. PROGRESSION
-- ----------------------------------------------------------------------------
create table public.progress (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    skill text not null, -- 'diction', 'articulation', 'fluidite', 'debit', ...
    score numeric not null check (score between 0 and 100),
    recorded_at timestamptz not null default now()
);

create index idx_progress_user_skill on public.progress(user_id, skill, recorded_at desc);

-- ----------------------------------------------------------------------------
-- 6. GAMIFICATION
-- ----------------------------------------------------------------------------
create table public.achievements (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null, -- ex: 'streak_7', 'first_session'
    label text not null,
    description text,
    icon text
);

create table public.user_achievements (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    achievement_id uuid not null references public.achievements(id) on delete cascade,
    unlocked_at timestamptz not null default now(),
    unique (user_id, achievement_id)
);

create table public.daily_challenges (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    challenge_date date not null default current_date,
    exercise_id uuid references public.exercises(id) on delete set null,
    status text check (status in ('a_faire', 'complete', 'manque')) default 'a_faire',
    unique (user_id, challenge_date)
);

-- ----------------------------------------------------------------------------
-- 7. ABONNEMENTS (squelette pour Stripe futur — vide fonctionnellement au départ)
-- ----------------------------------------------------------------------------
create table public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    plan text check (plan in ('gratuit', 'premium')) not null default 'gratuit',
    status text check (status in ('actif', 'annule', 'expire')) not null default 'actif',
    provider_ref text, -- id Stripe futur
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index idx_subscriptions_user on public.subscriptions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.exercise_categories enable row level security;
alter table public.exercises enable row level security;
alter table public.sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.speech_attempts enable row level security;
alter table public.transcriptions enable row level security;
alter table public.objective_metrics enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.subscriptions enable row level security;

-- profiles : l'utilisateur voit/modifie uniquement son propre profil
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- user_settings
create policy "user_settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);

-- exercise_categories / exercises : lecture publique pour tout utilisateur authentifié,
-- écriture réservée au rôle service (backend admin), donc AUCUNE policy insert/update
-- pour "authenticated" : le service_role bypass RLS nativement dans Supabase.
create policy "exercise_categories_select_all" on public.exercise_categories for select using (auth.role() = 'authenticated');
create policy "exercises_select_active" on public.exercises for select using (auth.role() = 'authenticated' and is_active = true);

-- sessions
create policy "sessions_select_own" on public.sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.sessions for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.sessions for update using (auth.uid() = user_id);

-- session_exercises : accès via la session parente (jointure implicite)
create policy "session_exercises_select_own" on public.session_exercises for select
    using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "session_exercises_insert_own" on public.session_exercises for insert
    with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "session_exercises_update_own" on public.session_exercises for update
    using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- speech_attempts
create policy "speech_attempts_select_own" on public.speech_attempts for select using (auth.uid() = user_id);
create policy "speech_attempts_insert_own" on public.speech_attempts for insert with check (auth.uid() = user_id);

-- transcriptions : accès via speech_attempt parent
create policy "transcriptions_select_own" on public.transcriptions for select
    using (exists (select 1 from public.speech_attempts sa where sa.id = speech_attempt_id and sa.user_id = auth.uid()));

-- objective_metrics : idem
create policy "objective_metrics_select_own" on public.objective_metrics for select
    using (exists (select 1 from public.speech_attempts sa where sa.id = speech_attempt_id and sa.user_id = auth.uid()));

-- ai_feedback : idem
create policy "ai_feedback_select_own" on public.ai_feedback for select
    using (exists (select 1 from public.speech_attempts sa where sa.id = speech_attempt_id and sa.user_id = auth.uid()));

-- progress
create policy "progress_select_own" on public.progress for select using (auth.uid() = user_id);

-- achievements : catalogue public en lecture
create policy "achievements_select_all" on public.achievements for select using (auth.role() = 'authenticated');

-- user_achievements
create policy "user_achievements_select_own" on public.user_achievements for select using (auth.uid() = user_id);

-- daily_challenges
create policy "daily_challenges_select_own" on public.daily_challenges for select using (auth.uid() = user_id);
create policy "daily_challenges_update_own" on public.daily_challenges for update using (auth.uid() = user_id);

-- subscriptions
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);

-- ============================================================================
-- NOTE IMPORTANTE
-- Toutes les opérations d'ÉCRITURE sur transcriptions, objective_metrics,
-- ai_feedback, speech_attempts (update), exercises (admin), achievements (admin)
-- passent exclusivement par le backend via la SERVICE ROLE KEY, qui contourne
-- RLS. Le frontend n'utilise JAMAIS la service role key — uniquement l'anon key
-- + le JWT de session utilisateur.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger utilitaire : maintenir updated_at à jour
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
    for each row execute function public.set_updated_at();
create trigger trg_user_settings_updated_at before update on public.user_settings
    for each row execute function public.set_updated_at();
create trigger trg_subscriptions_updated_at before update on public.subscriptions
    for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger : créer automatiquement un profil + des settings par défaut
-- à l'inscription d'un nouvel utilisateur Supabase Auth
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, display_name) values (new.id, new.email);
    insert into public.user_settings (user_id) values (new.id);
    insert into public.subscriptions (user_id, plan) values (new.id, 'gratuit');
    return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
