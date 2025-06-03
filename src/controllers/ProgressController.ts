import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { progressService } from "../services/progressService";
import { enrollmentService } from "../services/enrollmentService";
import { ProgressStatus } from "@prisma/client";
import { updateProgressSchema } from "../schemas/progress.schema";

class ProgressController {
  async updateProgress(
    request: FastifyRequest<{ Params: { lessonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { lessonId } = request.params;
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const { status } = updateProgressSchema.parse(request.body);

      const progress = await progressService.updateProgress(
        user.id,
        lessonId,
        status as ProgressStatus
      );

      return reply.send(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }

      if (
        error instanceof Error &&
        error.message === "User is not enrolled in this course"
      ) {
        return reply.status(403).send({ error: error.message });
      }

      console.error("Error updating progress:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getCourseProgress(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { courseId } = request.params;
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const isEnrolled = await enrollmentService.isEnrolled(user.id, courseId);
      if (!isEnrolled) {
        return reply.status(403).send({ error: "Not enrolled in this course" });
      }

      const progress = await progressService.getUserProgress(user.id, courseId);
      const overview = await progressService.calculateCourseProgress(
        user.id,
        courseId
      );

      return reply.send({
        modules: progress,
        overview,
      });
    } catch (error) {
      console.error("Error getting course progress:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getModuleProgress(
    request: FastifyRequest<{ Params: { moduleId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { moduleId } = request.params;
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const progress = await progressService.getModuleProgress(
        user.id,
        moduleId
      );
      return reply.send(progress);
    } catch (error) {
      console.error("Error getting module progress:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getLessonProgress(
    request: FastifyRequest<{ Params: { lessonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { lessonId } = request.params;
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const progress = await progressService.getLessonProgress(
        user.id,
        lessonId
      );
      return reply.send(progress);
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const progressController = new ProgressController();
