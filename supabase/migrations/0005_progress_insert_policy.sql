-- ============================================================================
-- ELOCUTIO — Policy manquante sur `progress`
-- ============================================================================
-- La migration 0001 ne définissait qu'une policy SELECT sur `progress`,
-- car à l'époque rien n'écrivait encore dans cette table. Depuis la Phase 5,
-- l'analyse IA d'un enregistrement (routes/speech.ts) y insère un point par
-- compétence évaluée, via le client scopé utilisateur (RLS actif) — il
-- manquait donc la policy INSERT correspondante.

create policy "progress_insert_own" on public.progress for insert with check (auth.uid() = user_id);
