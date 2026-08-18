/**
 * Couche d'abstraction Speech-to-Text : permet de swapper Gemini contre
 * Whisper, Google Speech, ou autre sans toucher aux routes qui l'utilisent.
 */

export interface TranscriptionResult {
  text: string;
  wordsCount: number;
}

export interface SpeechRecognitionService {
  /**
   * @param audioBase64 contenu audio encodé en base64 (pas de data: URI, juste les octets)
   * @param mimeType type MIME simple (ex: "audio/webm"), sans paramètres codec
   */
  transcribe(audioBase64: string, mimeType: string): Promise<TranscriptionResult>;
}
