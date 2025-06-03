import { hashPassword, verifyPassword } from "./cryptography";
import { generateToken } from "./jwtService";
import { PrismaClient } from "@prisma/client";
import { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";
import { TokenPayload } from "../schemas/auth.schema";

const prisma = new PrismaClient();

class AuthService {
  async register(userData: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    const tokenPayload: TokenPayload = {
      id: user.id,
      role: user.role,
    };

    return { user, token: generateToken(tokenPayload) };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      role: user.role,
    };

    return { user, token: generateToken(tokenPayload) };
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export const authService = new AuthService();
