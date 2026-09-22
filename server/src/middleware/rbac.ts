import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { db } from "../lib/prisma.js";

export function requireRole(...allowedRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      if (!req.organizationId) {
        return res.status(401).json({
          error: "Organization context missing",
        });
      }

      const user = await db.orm.public.User.first({
        id: req.userId,
        organizationId: req.organizationId,
      });

      if (!user) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}