export interface UserSettings {
  daily_duration_target_min: number;
  frequency_target_per_week: number;
  theme: "light" | "dark" | "system";
  notifications_enabled: boolean;
}

export interface Profile {
  id: string;
  display_name: string | null;
  level: "debutant" | "intermediaire" | "avance" | "expert";
  objective: string | null;
  speaking_context: string | null;
  onboarding_completed: boolean;
  user_settings: UserSettings[] | UserSettings | null;
}

export interface ExerciseCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: "facile" | "intermediaire" | "difficile" | "expert";
  duration_sec: number;
  target_skill: string | null;
  instructions?: string;
  content: Record<string, unknown>;
  exercise_categories?: { code: string; name: string };
}

export interface SessionExercise {
  id: string;
  display_order: number;
  completed: boolean;
  self_rating?: number | null;
  exercise_id: string;
  exercises: Exercise;
}

export interface TrainingSession {
  id: string;
  type: string;
  status: "en_cours" | "terminee" | "abandonnee";
  started_at: string;
  ended_at: string | null;
  session_exercises: SessionExercise[];
}

export interface DashboardData {
  total_sessions: number;
  completed_sessions: number;
  completed_exercises: number;
  current_streak_days: number;
  recent_sessions: { id: string; started_at: string; status: string }[];
}
