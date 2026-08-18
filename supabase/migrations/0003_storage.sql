-- ============================================================================
-- ELOCUTIO — Storage : bucket audio privé + policies
-- ============================================================================

-- Bucket privé (public = false) : les fichiers ne sont accessibles que via
-- une URL signée générée à la demande, jamais par URL publique directe.
insert into storage.buckets (id, name, public)
values ('speech-audio', 'speech-audio', false)
on conflict (id) do nothing;

-- Convention de nommage obligatoire : {user_id}/{uuid}.webm
-- Les policies s'appuient sur ce premier segment de chemin pour restreindre
-- chaque utilisateur à son propre dossier, exactement comme le fait RLS
-- sur les tables Postgres classiques.
create policy "speech_audio_insert_own_folder"
on storage.objects for insert
with check (
    bucket_id = 'speech-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "speech_audio_select_own_folder"
on storage.objects for select
using (
    bucket_id = 'speech-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "speech_audio_delete_own_folder"
on storage.objects for delete
using (
    bucket_id = 'speech-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
);
