import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Standard Error
  if (err instanceof Error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  // Unknown error
  return res.status(500).json({
    error: "Internal server error",
  });
}