import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN =
  env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(userId: string) {
  return jwt.sign(
    {
      sub: userId,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

export function readAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
}