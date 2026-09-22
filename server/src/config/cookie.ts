import type { CookieOptions } from "express";
import { env } from "./env.js";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};