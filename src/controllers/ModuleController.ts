import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { moduleService } from "../services/moduleService";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../schemas/module.schema";
import { courseService } from "../services/courseService";

class ModuleController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const moduleData = createModuleSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can create modules" });
      }

      const course = await courseService.findById(moduleData.courseId);
      if (!user || !course || course.authorId !== user.id) {
        return reply
          .status(403)
          .send({ error: "You can only add modules to your own courses" });
      }

      const module = await moduleService.create(moduleData);
      return reply.status(201).send(module);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error creating module:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const moduleData = updateModuleSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can update modules" });
      }

      if (!(await moduleService.isCourseAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only update modules in your own courses" });
      }

      const module = await moduleService.update(id, moduleData);
      return reply.send(module);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error updating module:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can delete modules" });
      }

      if (!(await moduleService.isCourseAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only delete modules in your own courses" });
      }

      await moduleService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const module = await moduleService.findById(id);

      if (!module) {
        return reply.status(404).send({ error: "Module not found" });
      }

      return reply.send(module);
    } catch (error) {
      console.error("Error getting module:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getByCourse(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { courseId } = request.params;
      const modules = await moduleService.findByCourse(courseId);
      return reply.send(modules);
    } catch (error) {
      console.error("Error getting course modules:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const moduleController = new ModuleController();
