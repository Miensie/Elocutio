import { env } from "../config/env.js";
import type { AIService } from "./AIService.js";
import { GeminiAIProvider } from "./providers/GeminiAIProvider.js";

let instance: AIService | null = null;

/**
 * Point d'entrée unique pour obtenir le service IA configuré. Instancié une
 * seule fois (lazy singleton) pour réutiliser la connexion du SDK entre
 * requêtes plutôt que d'en recréer une à chaque appel.
 */
export function getAIService(): AIService {
  if (instance) return instance;

  switch (env.AI_PROVIDER) {
    case "gemini":
      instance = new GeminiAIProvider();
      return instance;
    case "openai":
    case "anthropic":
      // Prévu par l'architecture (voir AIService.ts) mais pas encore
      // implémenté : ajouter providers/OpenAIProvider.ts ou
      // providers/AnthropicProvider.ts puis les brancher ici.
      throw new Error(`Provider IA "${env.AI_PROVIDER}" n'est pas encore implémenté.`);
    default:
      throw new Error(`Provider IA inconnu : ${env.AI_PROVIDER}`);
  }
}
