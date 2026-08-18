import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import type { SpeechRecognitionService, TranscriptionResult } from "../SpeechRecognitionService.js";

const TRANSCRIBE_PROMPT =
  "Transcris exactement ce qui est dit dans cet enregistrement audio, en français. " +
  "Ne reformule rien, ne corrige pas la grammaire, ne supprime pas les hésitations ou " +
  "répétitions : transcris fidèlement ce qui est entendu, y compris les \"euh\", \"hum\" et " +
  "répétitions s'il y en a. Si l'audio est inaudible, silencieux ou incompréhensible, réponds " +
  "exactement \"[INAUDIBLE]\". Réponds uniquement avec la transcription brute, sans aucun " +
  "commentaire, introduction, ni guillemets englobants.";

export class GeminiSpeechProvider implements SpeechRecognitionService {
  private client: GoogleGenAI;
  private model: string;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY manquant : impossible d'initialiser le provider Gemini.");
    }
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = env.GEMINI_MODEL;
  }

  async transcribe(audioBase64: string, mimeType: string): Promise<TranscriptionResult> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [
        { text: TRANSCRIBE_PROMPT },
        { inlineData: { mimeType, data: audioBase64 } }
      ]
    });

    const text = (response.text ?? "").trim();
    const isInaudible = text === "[INAUDIBLE]" || text.length === 0;
    const wordsCount = isInaudible ? 0 : text.split(/\s+/).filter(Boolean).length;

    return { text: isInaudible ? "" : text, wordsCount };
  }
}
