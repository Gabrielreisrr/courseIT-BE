"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const userRoutes_1 = require("./routes/userRoutes");
const testRoutes_1 = require("./routes/testRoutes");
class App {
    app;
    constructor() {
        this.app = (0, fastify_1.default)();
        this.middlewares();
        this.routes();
        this.serverLog();
    }
    async serverLog() {
        const port = Number(process.env.PORT) || 3000;
        try {
            await this.app.listen({ port, host: "0.0.0.0" });
            console.log(`Listening on port ${port}`);
            console.log(`Server started at http://localhost:${port}`);
        }
        catch (error) {
            console.error("Error starting server:", error);
            process.exit(1);
        }
    }
    middlewares() { }
    routes() {
        this.app.register(userRoutes_1.userRoutes, { prefix: "/users" });
        this.app.register(testRoutes_1.testRoutes, { prefix: "/" });
    }
}
exports.default = new App().app;
