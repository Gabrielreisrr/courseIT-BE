import { FastifyRequest, FastifyReply } from "fastify";
import { enrollmentService } from "../services/enrollmentService";
import { progressService } from "../services/progressService";
import { courseService } from "../services/courseService";

class EnrollmentController {
  async enroll(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const { courseId } = request.params;

      const course = await courseService.findById(courseId);
      if (!course) {
        return reply.status(404).send({ error: "Course not found" });
      }

      const isEnrolled = await enrollmentService.isEnrolled(user.id, courseId);
      if (isEnrolled) {
        return reply
          .status(400)
          .send({ error: "Already enrolled in this course" });
      }

      const enrollment = await enrollmentService.enroll(user.id, courseId);
      return reply.status(201).send(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async unenroll(
    request: FastifyRequest<{ Params: { enrollmentId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const { enrollmentId } = request.params;

      const enrollment = await enrollmentService.findById(enrollmentId);
      if (!enrollment) {
        return reply.status(404).send({ error: "Enrollment not found" });
      }

      if (enrollment.user.id !== user.id) {
        return reply
          .status(403)
          .send({ error: "You can only cancel your own enrollments" });
      }

      await enrollmentService.unenroll(enrollmentId);
      return reply.status(204).send();
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getUserEnrollments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const enrollments = await enrollmentService.getUserEnrollments(user.id);

      const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const progress = await progressService.calculateCourseProgress(
            user.id,
            enrollment.course.id
          );
          return {
            ...enrollment,
            progress,
          };
        })
      );

      return reply.send(enrollmentsWithProgress);
    } catch (error) {
      console.error("Error getting user enrollments:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getCourseEnrollments(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const { courseId } = request.params;

      const course = await courseService.findById(courseId);
      if (!course) {
        return reply.status(404).send({ error: "Course not found" });
      }

      if (course.authorId !== user.id && user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Only course author can view enrollments" });
      }

      const enrollments = await enrollmentService.getCourseEnrollments(
        courseId
      );
      return reply.send(enrollments);
    } catch (error) {
      console.error("Error getting course enrollments:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}

export const enrollmentController = new EnrollmentController();
