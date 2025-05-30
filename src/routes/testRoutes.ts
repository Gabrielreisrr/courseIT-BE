import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";

class HomeController {
  public async index(req: FastifyRequest, res: FastifyReply): Promise<void> {
    res.status(200).send({
      tudoCerto: true,
    });
  }
}
const home = new HomeController();

export async function testRoutes(app: FastifyInstance) {
  app.get("/", home.index);
}

// fastify.get("/dashboard", {
//   preHandler: [authMiddleware],
//   handler: dashboardController.index
// });
