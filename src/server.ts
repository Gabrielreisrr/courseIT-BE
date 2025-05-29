import Fastify, { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/userRoutes";
import { testRoutes } from "./routes/testRoutes";

class App {
  public app: FastifyInstance;

  constructor() {
    this.app = Fastify();
    this.middlewares();
    this.routes();
    this.serverLog();
  }

  private async serverLog(): Promise<void> {
    const port = Number(process.env.PORT) || 3000;
    try {
      await this.app.listen({ port, host: "0.0.0.0" });
      console.log(`Listening on port ${port}`);
      console.log(`Server started at http://localhost:${port}`);
    } catch (error) {
      console.error("Error starting server:", error);
      process.exit(1);
    }
  }

  private middlewares(): void {}

  private routes(): void {
    this.app.register(userRoutes, { prefix: "/users" });
    this.app.register(testRoutes, { prefix: "/" });
  }
}

export default new App().app;
