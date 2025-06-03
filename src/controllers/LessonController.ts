import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { lessonService } from "../services/lessonService";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../schemas/lesson.schema";
import { moduleService } from "../services/moduleService";

class LessonController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const lessonData = createLessonSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can create lessons" });
      }

      // Check if user is the course author
      const module = await moduleService.findById(lessonData.moduleId);
      if (!module || module.course.authorId !== user.id) {
        return reply
          .status(403)
          .send({ error: "You can only add lessons to your own courses" });
      }

      const lesson = await lessonService.create(lessonData);
      return reply.status(201).send(lesson);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error creating lesson:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const lessonData = updateLessonSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can update lessons" });
      }

      if (!(await lessonService.isCourseAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only update lessons in your own courses" });
      }

      const lesson = await lessonService.update(id, lessonData);
      return reply.send(lesson);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error updating lesson:", error);
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
          .send({ error: "Only admins can delete lessons" });
      }

      if (!(await lessonService.isCourseAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only delete lessons in your own courses" });
      }

      await lessonService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const lesson = await lessonService.findById(id);

      if (!lesson) {
        return reply.status(404).send({ error: "Lesson not found" });
      }

      return reply.send(lesson);
    } catch (error) {
      console.error("Error getting lesson:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getByModule(
    request: FastifyRequest<{ Params: { moduleId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { moduleId } = request.params;
      const lessons = await lessonService.findByModule(moduleId);
      return reply.send(lessons);
    } catch (error) {
      console.error("Error getting module lessons:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const lessonController = new LessonController();
