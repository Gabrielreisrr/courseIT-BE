import jwt from "jsonwebtoken";
import { TokenPayload } from "../schemas/auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "chave";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no .env");
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
}
