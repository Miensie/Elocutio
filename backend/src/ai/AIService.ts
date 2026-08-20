/**
 * Couche d'abstraction IA : la logique métier (routes) dépend uniquement de
 * cette interface, jamais de Gemini/OpenAI/Anthropic directement. Changer de
 * fournisseur = ajouter une classe dans providers/ et l'enregistrer dans
 * index.ts, sans toucher au reste de l'application.
 */

export interface FeedbackRequest {
  transcript: string;
  exerciseTitle: string;
  exerciseCategory: string;
  targetSkill: string | null;
  wordsPerMinute: number | null;
  hesitationCount: number;
  durationSec: number;
}

export interface FeedbackResult {
  /** Notes 0-100 par critère, ex: { fluidite: 72, clarte: 80, vocabulaire: 65, structure: 74 } */
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  advice: string;
  modelUsed: string;
}

export interface AIService {
  generateFeedback(input: FeedbackRequest): Promise<FeedbackResult>;
  /**
   * Génère un court message de coaching en langage naturel à partir du
   * profil vocal déjà calculé (voir coach/voiceProfile.ts). Ne fait AUCUN
   * calcul de score lui-même — uniquement de la formulation motivante à
   * partir de chiffres déjà établis, pour rester factuel plutôt qu'inventif.
   */
  generateCoachMessage(input: CoachMessageRequest): Promise<string>;
}

export interface CoachMessageRequest {
  displayName: string | null;
  objective: string | null;
  skills: { label: string; score: number; trend: number | null }[];
  strengths: string[];
  weaknesses: string[];
}
