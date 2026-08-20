-- ============================================================================
-- ELOCUTIO — Cache des messages du Coach IA
-- ============================================================================

-- Un seul message généré par utilisateur et par jour : contrainte unique qui
-- empêche mécaniquement d'appeler l'IA plusieurs fois pour la même journée,
-- même en cas de bug applicatif (voir routes/coach.ts).
create table public.coach_messages (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    message text not null,
    based_on_data boolean not null default false, -- false = message générique (pas assez de données), true = généré par l'IA à partir du profil réel
    generated_for_date date not null default current_date,
    created_at timestamptz not null default now(),
    unique (user_id, generated_for_date)
);

create index idx_coach_messages_user_date on public.coach_messages(user_id, generated_for_date desc);

alter table public.coach_messages enable row level security;

create policy "coach_messages_select_own" on public.coach_messages for select using (auth.uid() = user_id);
create policy "coach_messages_insert_own" on public.coach_messages for insert with check (auth.uid() = user_id);
create policy "coach_messages_update_own" on public.coach_messages for update using (auth.uid() = user_id);
