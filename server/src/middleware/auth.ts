import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { readAccessToken } from "../lib/auth.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const payload = readAccessToken(token);

  if (!payload || typeof payload.sub !== "string") {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }

  req.userId = payload.sub;

  next();
}