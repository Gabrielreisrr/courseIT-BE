import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../services/jwtService";
import { TokenPayload } from "../schemas/auth.schema";

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded; // Agora o TypeScript reconhece isso!
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).send({ error: "Token inválido" });
  }
}
