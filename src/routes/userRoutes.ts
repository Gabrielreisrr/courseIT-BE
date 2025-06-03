import { FastifyInstance } from "fastify";
import { userController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

export async function userRoutes(app: FastifyInstance) {
  app.post("/register", userController.create);
  app.post("/login", userController.login);

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.get("/me", userController.me);
    protectedRoutes.get("/:id", userController.getById);
    protectedRoutes.put("/:id", userController.update);
    protectedRoutes.delete("/:id", userController.delete);
    protectedRoutes.get("/", userController.getAll);
  });
}
