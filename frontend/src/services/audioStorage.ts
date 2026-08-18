import { supabase } from "./supabaseClient";

/**
 * Upload direct vers Supabase Storage depuis le navigateur — le fichier
 * audio ne transite jamais par notre backend Render (voir speech.ts côté
 * serveur pour le raisonnement). RLS sur storage.objects garantit que
 * chaque utilisateur ne peut écrire que dans son propre dossier
 * "{user_id}/...", donc on construit le chemin à partir de l'id utilisateur
 * réel de la session en cours plutôt que de le laisser deviner.
 */
export async function uploadAudioBlob(blob: Blob): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    throw new Error("Session expirée — reconnectez-vous avant d'enregistrer.");
  }

  const filename = `${userId}/${crypto.randomUUID()}.webm`;

  const { error } = await supabase.storage
    .from("speech-audio")
    .upload(filename, blob, { contentType: blob.type || "audio/webm", upsert: false });

  if (error) {
    throw new Error(`Échec de l'upload audio : ${error.message}`);
  }

  return filename;
}
