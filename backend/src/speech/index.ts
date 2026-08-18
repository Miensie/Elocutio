import { env } from "../config/env.js";
import type { SpeechRecognitionService } from "./SpeechRecognitionService.js";
import { GeminiSpeechProvider } from "./providers/GeminiSpeechProvider.js";

let instance: SpeechRecognitionService | null = null;

export function getSpeechRecognitionService(): SpeechRecognitionService {
  if (instance) return instance;

  switch (env.AI_PROVIDER) {
    case "gemini":
      instance = new GeminiSpeechProvider();
      return instance;
    case "openai":
    case "anthropic":
      // Prévu par l'architecture : brancher ici un provider Whisper (OpenAI)
      // ou autre le jour où c'est nécessaire.
      throw new Error(`Provider de transcription pour "${env.AI_PROVIDER}" pas encore implémenté.`);
    default:
      throw new Error(`Provider de transcription inconnu : ${env.AI_PROVIDER}`);
  }
}
