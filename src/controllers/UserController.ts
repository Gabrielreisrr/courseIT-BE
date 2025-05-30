import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { authService } from "../services/authService";

import { createUserSchema, loginUserSchema } from "../schemas/user.schema";

class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = createUserSchema.parse(request.body);

      const user = await authService.register(userData);

      reply.status(201).send({
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error("Erro ao criar usuário:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginData = loginUserSchema.parse(request.body);

      const { user, token } = await authService.login(
        loginData.email,
        loginData.password
      );

      reply.status(200).send({
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error("Erro ao logar usuário:", error);
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }
  }
}

export const userController = new UserController();
