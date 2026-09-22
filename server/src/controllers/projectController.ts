import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/projectSchema.js";
import { writeAuditLog } from "../utils/audit.js";

const uuidSchema = z.string().uuid();

export async function createProject(
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

    const parsed = createProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const { name, description, teamId } = parsed.data;

    if (teamId) {
      const team = await db.orm.public.Team.first({
        id: teamId,
        organizationId: req.organizationId,
      });

      if (!team) {
        return res.status(400).json({
          error: "Team not found in your organization",
        });
      }
    }

    const project = await db.orm.public.Project.create({
      name,
      description,
      teamId,
      organizationId: req.organizationId,
      createdById: req.userId,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "PROJECT_CREATED",
      resource: "Project",
      resourceId: project.id,
      metadata: {
        name: project.name,
      },
      req,
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(
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

    const projects = await db.orm.public.Project
      .where({
        organizationId: req.organizationId,
      })
      .all();

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id as string;

  try {
    if (!uuidSchema.safeParse(id).success) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(
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
        error: "Project not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const parsed = updateProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "No fields provided for update",
      });
    }

    if (data.teamId !== undefined) {
      if (!uuidSchema.safeParse(data.teamId).success) {
        return res.status(400).json({
          error: "teamId must be a valid UUID",
        });
      }

      const team = await db.orm.public.Team.first({
        id: data.teamId,
        organizationId: req.organizationId,
      });

      if (!team) {
        return res.status(400).json({
          error: "Team not found in your organization",
        });
      }
    }

    const updatedProject = await db.orm.public.Project
      .where({
        id: project.id,
      })
      .update(data);

    if (!updatedProject) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "PROJECT_UPDATED",
      resource: "Project",
      resourceId: updatedProject.id,
      metadata: {
        fields: Object.keys(parsed.data),
      },
      req,
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(
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
        error: "Project not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    await db.orm.public.Project
      .where({
        id: project.id,
      })
      .delete();

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "PROJECT_DELETED",
      resource: "Project",
      resourceId: project.id,
      metadata: {
        name: project.name,
      },
      req,
    });

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(
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
        error: "Project not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const { userId } = req.body;

    if (
      typeof userId !== "string" ||
      !uuidSchema.safeParse(userId).success
    ) {
      return res.status(400).json({
        error: "userId must be a valid UUID",
      });
    }

    const user = await db.orm.public.User.first({
      id: userId,
      organizationId: req.organizationId,
    });

    if (!user) {
      return res.status(400).json({
        error: "User not found in your organization",
      });
    }

    const existingMember = await db.orm.public.ProjectMember.first({
      projectId: project.id,
      userId: user.id,
    });

    if (existingMember) {
      return res.status(409).json({
        error: "User is already a project member",
      });
    }

    const member = await db.orm.public.ProjectMember.create({
      projectId: project.id,
      userId: user.id,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "PROJECT_MEMBER_ADDED",
      resource: "Project",
      resourceId: project.id,
      metadata: {
        memberUserId: user.id,
      },
      req,
    });

    return res.status(201).json({
      message: "Project member added successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectMembers(
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
        error: "Project not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const memberships = await db.orm.public.ProjectMember
      .where({
        projectId: project.id,
      })
      .all();

    const members = [];

    for (const membership of memberships) {
      const user = await db.orm.public.User.first({
        id: membership.userId,
        organizationId: req.organizationId,
      });

      if (!user) {
        continue;
      }

      members.push({
        membershipId: membership.id,
        joinedAt: membership.joinedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      });
    }

    return res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
      },
      members,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(
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
        error: "Project not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const { userId } = req.body;

    if (
      typeof userId !== "string" ||
      !uuidSchema.safeParse(userId).success
    ) {
      return res.status(400).json({
        error: "userId must be a valid UUID",
      });
    }

    const member = await db.orm.public.ProjectMember.first({
      projectId: project.id,
      userId,
    });

    if (!member) {
      return res.status(404).json({
        error: "Project member not found",
      });
    }

    await db.orm.public.ProjectMember
      .where({
        id: member.id,
      })
      .delete();

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "PROJECT_MEMBER_REMOVED",
      resource: "Project",
      resourceId: project.id,
      metadata: {
        memberUserId: member.userId,
      },
      req,
    });

    return res.status(200).json({
      message: "Project member removed successfully",
    });
  } catch (error) {
    next(error);
  }
}