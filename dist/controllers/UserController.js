"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: zod_1.z.string().email("E-mail inválido"),
    password: zod_1.z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
class UserController {
    async create(request, reply) {
        try {
            const userData = userSchema.parse(request.body);
            console.log("User created:", userData);
            reply.status(201).send({ message: "User created successfully" });
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            return reply.status(500).send({ error: "Erro interno do servidor" });
        }
    }
    async login(request, reply) {
        try {
            const loginData = loginSchema.parse(request.body);
            console.log("User logged in:", loginData);
            reply.status(200).send({ message: "Login successful" });
        }
        catch (error) {
            console.error("Erro ao logar usuário:", error);
            return reply.status(500).send({ error: "Erro interno do servidor" });
        }
    }
}
exports.userController = new UserController();
