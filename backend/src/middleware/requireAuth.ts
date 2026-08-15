import type { FastifyRequest, FastifyReply } from "fastify";
import { supabaseAdmin } from "../database/supabaseAdmin.js";

// Étend le type FastifyRequest pour porter l'utilisateur authentifié
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    accessToken?: string;
  }
}

/**
 * Vérifie le header "Authorization: Bearer <jwt>" envoyé par le frontend
 * (émis par Supabase Auth côté client) et attache l'id utilisateur à la
 * requête. Toute route protégée doit déclarer ce hook en preHandler.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.code(401).send({ message: "Authentification requise" });
  }

  const token = authHeader.slice("Bearer ".length);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return reply.code(401).send({ message: "Session invalide ou expirée" });
  }

  request.userId = data.user.id;
  request.accessToken = token;
}
