import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";

import {
  hashPassword,
  comparePassword,
  createAccessToken,
} from "../lib/auth.js";

import {
  registerSchema,
  loginSchema,
} from "../schemas/authSchema.js";

import { accessTokenCookieOptions } from "../config/cookie.js";

import { writeAuditLog } from "../utils/audit.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = registerSchema.safeParse(req.body);

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
      organizationName,
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

     const organization = await db.orm.public.Organization.create({
       name: organizationName,
     });

    const user = await db.orm.public.User.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
      organizationId: organization.id,
    });

    await writeAuditLog({
      organizationId: organization.id,
      userId: user.id,
      action: "REGISTER",
      resource: "User",
      resourceId: user.id,
      metadata: {
        role: user.role,
      },
      req,
    });

    const token = createAccessToken(user.id);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const user = await db.orm.public.User.first({
      email,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      await writeAuditLog({
        organizationId: user.organizationId,
        userId: user.id,
        action: "LOGIN_FAILED",
        resource: "User",
        resourceId: user.id,
        metadata: {
          reason: "INVALID_PASSWORD",
        },
        req,
      });

      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    await writeAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: "LOGIN_SUCCESS",
      resource: "User",
      resourceId: user.id,
      req,
    });

    const token = createAccessToken(user.id);

    res.cookie(
      "accessToken",
      token,
      accessTokenCookieOptions
    );
    
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await db.orm.public.User.first({
      id: req.userId,
    });

    if (user) {
      await writeAuditLog({
        organizationId: user.organizationId,
        userId: user.id,
        action: "LOGOUT",
        resource: "User",
        resourceId: user.id,
        req,
      });
    }

    res.clearCookie(
      "accessToken",
      accessTokenCookieOptions
    );

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}