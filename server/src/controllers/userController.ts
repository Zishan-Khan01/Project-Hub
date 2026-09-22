import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";

import {
  createUserSchema,
  updateUserSchema,
} from "../schemas/userSchema.js";

import { hashPassword } from "../lib/auth.js";

import { writeAuditLog } from "../utils/audit.js";

export async function getCurrentUser(
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

    const users = await db.orm.public.User.where({
      organizationId: req.organizationId,
    }).all();

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

    const user = await db.orm.public.User.first({
      id: req.params.id,
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
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already registered",
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
    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!req.organizationId) {
      return res.status(400).json({
        error: "Organization context missing",
      });
    }

    const targetUserId = req.params.id;

    if (!targetUserId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    const result = updateUserSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid user data",
        details: result.error.flatten(),
      });
    }

    const data = result.data;

    const targetUser =
      await db.orm.public.User.first({
        id: targetUserId,
      });

    if (!targetUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /*
     * Tenant isolation
     */
    if (
      targetUser.organizationId !==
      req.organizationId
    ) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /*
     * A user cannot change their own role.
     *
     * They can still change their own
     * name/email if the requester is an Admin.
     */
    if (
      targetUserId === req.userId &&
      data.role !== undefined
    ) {
      return res.status(403).json({
        error: "You cannot change your own role",
      });
    }

    /*
     * Prevent the last Admin from being
     * demoted.
     */
    if (
      targetUser.role === "ADMIN" &&
      data.role !== undefined &&
      data.role !== "ADMIN"
    ) {
      const organizationUsers =
        await db.orm.public.User.where({
          organizationId:
            req.organizationId,
        }).all();

      const adminCount =
        organizationUsers.filter(
          (user) => user.role === "ADMIN"
        ).length;

      if (adminCount <= 1) {
        return res.status(400).json({
          error:
            "The last Admin cannot be demoted",
        });
      }
    }

    const updateData: Record<
      string,
      unknown
    > = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email =
        data.email.toLowerCase();
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    const updatedUser =
      await db.orm.public.User.where({
        id: targetUserId,
      }).update(updateData);

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "USER_UPDATED",
      resource: "User",
      resourceId: updatedUser.id,
      metadata: {
        fields: Object.keys(updateData),
      },
      req,
    });

    if (
      data.role !== undefined &&
      data.role !== targetUser.role
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
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        organizationId:
          updatedUser.organizationId,
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
    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!req.organizationId) {
      return res.status(400).json({
        error: "Organization context missing",
      });
    }

    const targetUserId = req.params.id;

    if (!targetUserId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    /*
     * User cannot delete themselves.
     */
    if (targetUserId === req.userId) {
      return res.status(403).json({
        error: "You cannot delete your own account",
      });
    }

    const targetUser =
      await db.orm.public.User.first({
        id: targetUserId,
      });

    if (!targetUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /*
     * Tenant isolation
     */
    if (
      targetUser.organizationId !==
      req.organizationId
    ) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /*
     * Prevent deletion of the last Admin.
     */
    if (targetUser.role === "ADMIN") {
      const organizationUsers =
        await db.orm.public.User.where({
          organizationId:
            req.organizationId,
        }).all();

      const adminCount =
        organizationUsers.filter(
          (user) => user.role === "ADMIN"
        ).length;

      if (adminCount <= 1) {
        return res.status(400).json({
          error:
            "The last Admin cannot be deleted",
        });
      }
    }

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "USER_DELETED",
      resource: "User",
      resourceId: targetUser.id,
      metadata: {
        role: targetUser.role,
      },
      req,
    });
    /*
     * Verify the user still belongs to the
     * current organization before deleting.
     */
    await db.orm.public.User.where({
      id: targetUserId,
    }).delete();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}