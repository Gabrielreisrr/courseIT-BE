import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { courseService } from "../services/courseService";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../schemas/course.schema";

class CourseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const courseData = createCourseSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can create courses" });
      }

      const course = await courseService.create(user.id, courseData);

      return reply.status(201).send(course);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error creating course:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const courseData = updateCourseSchema.parse(request.body);
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can update courses" });
      }

      if (!(await courseService.isAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only update your own courses" });
      }

      const course = await courseService.update(id, courseData);

      return reply.send(course);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      console.error("Error updating course:", error);
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
          .send({ error: "Only admins can delete courses" });
      }

      if (!(await courseService.isAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only delete your own courses" });
      }

      await courseService.delete(id);

      return reply.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const course = await courseService.findById(id);

      if (!course) {
        return reply.status(404).send({ error: "Course not found" });
      }

      return reply.send(course);
    } catch (error) {
      console.error("Error getting course:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const courses = await courseService.findAll();
      return reply.send(courses);
    } catch (error) {
      console.error("Error getting courses:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const courseController = new CourseController();
