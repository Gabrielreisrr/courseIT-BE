import { z } from "zod";

const baseUserSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

export const createUserSchema = baseUserSchema;

export const loginUserSchema = z.object({
  email: baseUserSchema.shape.email,
  password: baseUserSchema.shape.password,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
