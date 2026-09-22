import { doubleCsrf } from "csrf-csrf";

import { env } from "../config/env.js";

const isProduction = env.isProduction;

const csrfSecret = env.CSRF_SECRET;

export const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => csrfSecret,

  getSessionIdentifier: (req) => {
    return req.cookies?.accessToken || "anonymous";
  },

  cookieName: isProduction
    ? "__Host-psifi.x-csrf-token"
    : "x-csrf-token",

  cookieOptions: {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  },

  size: 64,

  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});