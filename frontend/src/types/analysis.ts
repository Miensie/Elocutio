export interface Transcription {
  text: string;
  words_count: number;
}

export interface ObjectiveMetrics {
  words_per_minute: number | null;
  pause_count: number | null;
  pause_total_sec: number | null;
  hesitation_count: number | null;
}

export interface AIFeedback {
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  advice: string;
  model_used: string;
}

export interface SpeechAnalysis {
  transcription: Transcription | null;
  objective_metrics: ObjectiveMetrics | null;
  ai_feedback: AIFeedback | null;
  message?: string;
  cached?: boolean;
}
