import { FastifyInstance } from "fastify";
import { enrollmentController } from "../controllers/EnrollmentController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function enrollmentRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post("/courses/:courseId", enrollmentController.enroll);
    protectedRoutes.delete("/:enrollmentId", enrollmentController.unenroll);
    protectedRoutes.get("/my", enrollmentController.getUserEnrollments);
    protectedRoutes.get(
      "/courses/:courseId",
      enrollmentController.getCourseEnrollments
    );
  });
}
