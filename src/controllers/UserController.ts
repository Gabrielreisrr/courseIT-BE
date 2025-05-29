import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = userSchema.parse(request.body);
      console.log("User created:", userData);
      reply.status(201).send({ message: "User created successfully" });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginData = loginSchema.parse(request.body);
      console.log("User logged in:", loginData);
      reply.status(200).send({ message: "Login successful" });
    } catch (error) {
      console.error("Erro ao logar usuário:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }
}

export const userController = new UserController();
