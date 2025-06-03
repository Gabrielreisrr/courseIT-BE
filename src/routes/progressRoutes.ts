import { FastifyInstance } from "fastify";
import { progressController } from "../controllers/ProgressController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function progressRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post(
      "/lessons/:lessonId",
      progressController.updateProgress
    );
    protectedRoutes.get(
      "/courses/:courseId",
      progressController.getCourseProgress
    );
    protectedRoutes.get(
      "/modules/:moduleId",
      progressController.getModuleProgress
    );
    protectedRoutes.get(
      "/lessons/:lessonId",
      progressController.getLessonProgress
    );
  });
}
