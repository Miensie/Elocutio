import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { profileRoutes } from "./routes/profile.js";
import { exercisesRoutes } from "./routes/exercises.js";
import { sessionsRoutes } from "./routes/sessions.js";
import { dashboardRoutes } from "./routes/dashboard.js";

const app = Fastify({ logger: true });

// CORS : liste blanche d'origines (configurable par environnement,
// jamais "*" en production dès qu'on manipule un token utilisateur).
await app.register(cors, { origin: env.CORS_ORIGINS, credentials: true });

// Rate limiting global — protection minimale contre les abus,
// resserré plus finement sur les routes IA à l'étape correspondante.
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

// Gestion d'erreurs centralisée : jamais de stack trace exposée au client
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode = error.statusCode ?? 500;
  reply.code(statusCode).send({
    message: statusCode === 500 ? "Erreur interne du serveur" : error.message
  });
});

await app.register(healthRoutes);
await app.register(profileRoutes);
await app.register(exercisesRoutes);
await app.register(sessionsRoutes);
await app.register(dashboardRoutes);

app
  .listen({ port: Number(env.PORT), host: "0.0.0.0" })
  .then(() => app.log.info(`Elocutio backend démarré sur le port ${env.PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
