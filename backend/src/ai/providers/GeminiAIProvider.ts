import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import type { AIService, FeedbackRequest, FeedbackResult } from "../AIService.js";

// Schéma de sortie structurée : Gemini renvoie du JSON garanti conforme à
// cette forme (responseSchema), on évite ainsi le parsing fragile de texte
// libre et les hallucinations de format.
const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    scores: {
      type: "object",
      properties: {
        fluidite: { type: "number" },
        clarte: { type: "number" },
        vocabulaire: { type: "number" },
        structure: { type: "number" }
      },
      required: ["fluidite", "clarte", "vocabulaire", "structure"]
    },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    advice: { type: "string" }
  },
  required: ["scores", "strengths", "weaknesses", "advice"]
} as const;

function buildPrompt(input: FeedbackRequest): string {
  return `Tu es un coach vocal francophone, bienveillant mais honnête. Tu évalues UNE tentative
d'exercice de prise de parole, pas la personne elle-même.

Exercice : "${input.exerciseTitle}" (catégorie : ${input.exerciseCategory}${
    input.targetSkill ? `, compétence ciblée : ${input.targetSkill}` : ""
  })
Durée de l'enregistrement : ${input.durationSec.toFixed(0)} secondes
Débit mesuré objectivement : ${
    input.wordsPerMinute ? `${input.wordsPerMinute.toFixed(0)} mots/minute` : "non disponible"
  }
Hésitations détectées dans la transcription (« euh », « hum ») : ${input.hesitationCount}

Transcription de l'enregistrement :
"""
${input.transcript || "(transcription vide ou inaudible)"}
"""

Consignes :
- Note chaque critère de 0 à 100 : fluidite, clarte, vocabulaire, structure.
- Base tes notes sur la transcription ET les mesures objectives fournies, pas sur des suppositions.
- Donne 2 à 3 points forts concrets et 2 à 3 points à travailler concrets, spécifiques à cette
  tentative (pas de généralités).
- Donne UN conseil pratique et actionnable pour la prochaine tentative.
- Reste bref. Ne juge jamais la personne, uniquement la performance de cet exercice précis.
- Si la transcription est vide, trop courte ou incohérente, dis-le honnêtement plutôt que d'inventer
  une évaluation détaillée.`;
}

export class GeminiAIProvider implements AIService {
  private client: GoogleGenAI;
  private model: string;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY manquant : impossible d'initialiser le provider Gemini.");
    }
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = env.GEMINI_MODEL;
  }

  async generateFeedback(input: FeedbackRequest): Promise<FeedbackResult> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseSchema: FEEDBACK_SCHEMA
      }
    });

    const raw = response.text;
    if (!raw) {
      throw new Error("Réponse vide du modèle IA");
    }

    let parsed: {
      scores?: Record<string, number>;
      strengths?: string[];
      weaknesses?: string[];
      advice?: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Réponse du modèle IA non parsable en JSON");
    }

    return {
      scores: parsed.scores ?? {},
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      advice: parsed.advice ?? "",
      modelUsed: this.model
    };
  }
}
