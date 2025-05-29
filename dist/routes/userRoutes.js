"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const UserController_1 = require("../controllers/UserController");
async function userRoutes(app) {
    app.post("/", UserController_1.userController.create);
    app.post("/login", UserController_1.userController.login);
}
