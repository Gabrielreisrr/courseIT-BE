import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { authService } from "../services/authService";
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
} from "../schemas/user.schema";

class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = createUserSchema.parse(request.body);
      const { user, token } = await authService.register(userData);

      return reply.status(201).send({
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid data",
          details: error.errors,
        });
      }

      console.error("Error creating user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginData = loginUserSchema.parse(request.body);
      const { user, token } = await authService.login(
        loginData.email,
        loginData.password
      );

      return reply.status(200).send({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid data",
          details: error.errors,
        });
      }

      console.error("Error during login:", error);
      return reply.status(401).send({ error: "Invalid credentials" });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.params.id;
      const updateData = updateUserSchema.parse(request.body);

      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      if (request.user.id !== userId && request.user.role !== "ADMIN") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const updatedUser = await authService.updateUser(userId, updateData);

      return reply.send({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid data",
          details: error.errors,
        });
      }

      console.error("Error updating user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.params.id;

      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      if (request.user.id !== userId && request.user.role !== "ADMIN") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      await authService.deleteUser(userId);
      return reply.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.params.id;

      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      if (request.user.id !== userId && request.user.role !== "ADMIN") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const user = await authService.findUserById(userId);

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("Error getting user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user || request.user.role !== "ADMIN") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const users = await authService.findAllUsers();
      return reply.send(users);
    } catch (error) {
      console.error("Error listing users:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const user = await authService.findUserById(request.user.id);

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("Error getting current user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const userController = new UserController();
