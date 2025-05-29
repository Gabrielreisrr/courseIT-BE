import { FastifyInstance } from "fastify";
import { userController } from "../controllers/UserController";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", userController.create);
  app.post("/login", userController.login);
}
