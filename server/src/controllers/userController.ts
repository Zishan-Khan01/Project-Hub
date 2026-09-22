import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../schemas/userSchema.js";

import { hashPassword } from "../lib/auth.js";
import { writeAuditLog } from "../utils/audit.js";

const uuidSchema = z.string().uuid();

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId || !req.organizationId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const user = await db.orm.public.User.first({
      id: req.userId,
      organizationId: req.organizationId,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    const users = await db.orm.public.User
      .where({
        organizationId: req.organizationId,
      })
      .all();

    return res.status(200).json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    const id = req.params.id as string;

    if (!uuidSchema.safeParse(id).success) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = await db.orm.public.User.first({
      id,
      organizationId: req.organizationId,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const {
      name,
      email,
      password,
      role,
    } = parsed.data;

    const existingUser = await db.orm.public.User.first({
      email,
      organizationId: req.organizationId,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.orm.public.User.create({
      name,
      email,
      passwordHash,
      role,
      organizationId: req.organizationId,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "USER_CREATED",
      resource: "User",
      resourceId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
      req,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const targetUserId = req.params.id as string;

    if (!uuidSchema.safeParse(targetUserId).success) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const targetUser = await db.orm.public.User.first({
      id: targetUserId,
      organizationId: req.organizationId,
    });

    if (!targetUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({
        error: "No fields provided for update",
      });
    }

    if (
      targetUser.id === req.userId &&
      parsed.data.role !== undefined &&
      parsed.data.role !== targetUser.role
    ) {
      return res.status(403).json({
        error: "You cannot change your own role",
      });
    }

    const updateData: {
      name?: string;
      email?: string;
      passwordHash?: string;
      role?: typeof targetUser.role;
    } = {};

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }

    if (parsed.data.email !== undefined) {
      updateData.email = parsed.data.email;
    }

    if (parsed.data.role !== undefined) {
      updateData.role = parsed.data.role;
    }

    if (parsed.data.email !== undefined) {
      const existingUser = await db.orm.public.User.first({
        email: parsed.data.email,
        organizationId: req.organizationId,
      });

      if (
        existingUser &&
        existingUser.id !== targetUser.id
      ) {
        return res.status(409).json({
          error: "User with this email already exists",
        });
      }
    }

    if (parsed.data.password !== undefined) {
      updateData.passwordHash = await hashPassword(
        parsed.data.password
      );
    }

    const updatedUser = await db.orm.public.User
      .where({
        id: targetUserId,
      })
      .update(updateData);

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "USER_UPDATED",
      resource: "User",
      resourceId: updatedUser.id,
      metadata: {
        fields: Object.keys(parsed.data),
      },
      req,
    });

    if (
      parsed.data.role !== undefined &&
      parsed.data.role !== targetUser.role
    ) {
      await writeAuditLog({
        organizationId: req.organizationId,
        userId: req.userId,
        action: "USER_ROLE_CHANGED",
        resource: "User",
        resourceId: updatedUser.id,
        metadata: {
          previousRole: targetUser.role,
          newRole: updatedUser.role,
        },
        req,
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        organizationId: updatedUser.organizationId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const targetUserId = req.params.id as string;

    if (!uuidSchema.safeParse(targetUserId).success) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (targetUserId === req.userId) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    const targetUser = await db.orm.public.User.first({
      id: targetUserId,
      organizationId: req.organizationId,
    });

    if (!targetUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await db.orm.public.User
      .where({
        id: targetUser.id,
      })
      .delete();

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "USER_DELETED",
      resource: "User",
      resourceId: targetUser.id,
      metadata: {
        email: targetUser.email,
        role: targetUser.role,
      },
      req,
    });

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}