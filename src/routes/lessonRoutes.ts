import { FastifyInstance } from "fastify";
import { lessonController } from "../controllers/LessonController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function lessonRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post("/", lessonController.create);
    protectedRoutes.put("/:id", lessonController.update);
    protectedRoutes.delete("/:id", lessonController.delete);
    protectedRoutes.get("/:id", lessonController.getById);
    protectedRoutes.get("/module/:moduleId", lessonController.getByModule);
  });
}
