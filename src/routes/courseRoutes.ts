import { FastifyInstance } from "fastify";
import { courseController } from "../controllers/CourseController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function courseRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post("/", courseController.create);
    protectedRoutes.put("/:id", courseController.update);
    protectedRoutes.delete("/:id", courseController.delete);
    protectedRoutes.get("/:id", courseController.getById);
    protectedRoutes.get("/", courseController.getAll);
  });
}
