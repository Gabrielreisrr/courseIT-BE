import { FastifyInstance } from "fastify";
import { moduleController } from "../controllers/ModuleController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function moduleRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post("/", moduleController.create);
    protectedRoutes.put("/:id", moduleController.update);
    protectedRoutes.delete("/:id", moduleController.delete);
    protectedRoutes.get("/:id", moduleController.getById);
    protectedRoutes.get("/course/:courseId", moduleController.getByCourse);
  });
}
