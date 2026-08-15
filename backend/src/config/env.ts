import "dotenv/config";
import { z } from "zod";

// Validation stricte au démarrage : l'app refuse de démarrer si une variable
// obligatoire manque, plutôt que d'échouer plus tard de façon confuse.
const envSchema = z.object({
  PORT: z.string().default("3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  // La service role key ne doit JAMAIS être exposée au frontend.
  // Elle sert au backend pour les opérations qui contournent RLS
  // (ex: écrire un ai_feedback généré par le serveur).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER: z.enum(["gemini", "openai", "anthropic"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  // Liste d'origines autorisées séparées par des virgules, ex :
  // "http://localhost:5173,https://username.github.io"
  // (l'origine ne contient jamais de chemin — https://username.github.io
  // suffit même si le site est servi sous /nom-du-repo/)
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
};
