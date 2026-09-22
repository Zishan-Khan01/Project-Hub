import type { Request } from "express";
import { db } from "../lib/prisma.js";

type AuditLogInput = {
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
};

export async function writeAuditLog({
  organizationId,
  userId,
  action,
  resource,
  resourceId,
  metadata,
  req,
}: AuditLogInput) {
  await db.orm.public.AuditLog.create({
    organizationId,
    userId,
    action,
    resource,
    resourceId,
    metadata,
    ipAddress: req?.ip,
    userAgent: req?.get("user-agent"),
  });
}	