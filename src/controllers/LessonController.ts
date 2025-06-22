import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { lessonService } from "../services/lessonService";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../schemas/lesson.schema";
import { moduleService } from "../services/moduleService";
import path from "path";
import fs from "fs";
import * as fastifyMultipart from "@fastify/multipart";

declare module "fastify" {
  interface FastifyRequest {
    file: (
      options?:
        | Omit<import("@fastify/busboy").BusboyConfig, "headers">
        | fastifyMultipart.FastifyMultipartBaseOptions
    ) => Promise<fastifyMultipart.MultipartFile | undefined>;
  }
}

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

  async uploadVideo(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const user = request.user;

      if (!user || user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only admins can upload lesson videos" });
      }

      if (!(await lessonService.isCourseAuthor(id, user.id))) {
        return reply
          .status(403)
          .send({ error: "You can only upload videos for your own lessons" });
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: "Invalid video format" });
      }

      const ext = path.extname(data.filename);
      const fileName = `lesson_${id}_${Date.now()}${ext}`;
      const uploadPath = path.join(__dirname, "../../uploads/videos", fileName);
      const writeStream = fs.createWriteStream(uploadPath);
      await data.file.pipe(writeStream);

      await new Promise<void>((resolve, reject) => {
        writeStream.on("finish", () => resolve());
        writeStream.on("error", () => reject());
      });

      const videoUrl = `/videos/${fileName}`;
      await lessonService.update(id, { videoUrl });
      return reply.send({ videoUrl });
    } catch (error) {
      console.error("Error uploading lesson video:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const lessonController = new LessonController();
