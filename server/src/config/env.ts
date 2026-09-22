import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV || "development";

const rawPort = process.env.PORT || "3000";
const PORT = Number(rawPort);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid number between 1 and 65535");
}

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const CSRF_SECRET = process.env.CSRF_SECRET;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

if (!CSRF_SECRET || CSRF_SECRET.length < 32) {
  throw new Error("CSRF_SECRET must be at least 32 characters");
}

export const env = {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CSRF_SECRET,
  isProduction: NODE_ENV === "production",
};