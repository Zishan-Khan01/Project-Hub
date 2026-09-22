import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

const csrfSecret =
  process.env.CSRF_SECRET || "development-csrf-secret-change-me";

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