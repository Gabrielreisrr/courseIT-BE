import { hashPassword, verifyPassword } from "./cryptography";
import { generateToken } from "./jwtService";
import { PrismaClient } from "@prisma/client";
import { CreateUserInput } from "../schemas/user.schema";
import { TokenPayload } from "../schemas/auth.schema";

const prisma = new PrismaClient();

class AuthService {
  async register(userData: CreateUserInput) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Senha inválida");
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
    };

    return { user, token: generateToken(tokenPayload) };
  }
}

export const authService = new AuthService();
