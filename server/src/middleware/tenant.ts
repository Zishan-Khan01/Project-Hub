import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";

export async function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const user = await db.orm.public.User.first({
      id: req.userId,
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.organizationId = user.organizationId;

    next();
  } catch (error) {
    next(error);
  }
}