import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { userRoutes } from "./routes/userRoutes";
import { courseRoutes } from "./routes/courseRoutes";
import { moduleRoutes } from "./routes/moduleRoutes";
import { lessonRoutes } from "./routes/lessonRoutes";
import { enrollmentRoutes } from "./routes/enrollmentRoutes";
import { progressRoutes } from "./routes/progressRoutes";
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

  private middlewares(): void {
    this.app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    });
  }

  private routes(): void {
    this.app.register(userRoutes, { prefix: "api/users" });
    this.app.register(courseRoutes, { prefix: "api/courses" });
    this.app.register(moduleRoutes, { prefix: "api/modules" });
    this.app.register(lessonRoutes, { prefix: "api/lessons" });
    this.app.register(enrollmentRoutes, { prefix: "api/enrollments" });
    this.app.register(progressRoutes, { prefix: "api/progress" });
    this.app.register(testRoutes, { prefix: "api/" });
  }
}

export default new App().app;
