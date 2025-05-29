"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRoutes = testRoutes;
class HomeController {
    async index(req, res) {
        res.status(200).send({
            tudoCerto: true,
        });
    }
}
const home = new HomeController();
async function testRoutes(app) {
    app.get("/", home.index);
}
