import type { Request, Response, NextFunction } from "express";

import { db } from "../lib/prisma.js";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../schemas/teamSchema.js";

import { writeAuditLog } from "../utils/audit.js";

export async function createTeam(
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

    const parsed = createTeamSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const { name } = parsed.data;

    const team = await db.orm.public.Team.create({
      name,
      organizationId: req.organizationId,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TEAM_CREATED",
      resource: "Team",
      resourceId: team.id,
      metadata: {
        name: team.name,
      },
      req,
    });

    return res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
}


export async function getTeams(
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

    const teams = await db.orm.public.Team
      .where({
        organizationId: req.organizationId,
      })
      .all();

    return res.status(200).json({
      teams,
    });
  } catch (error) {
    next(error);
  }
}


export async function getTeamById(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    return res.status(200).json({
      team,
    });
  } catch (error) {
    next(error);
  }
}


export async function updateTeam(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const parsed = updateTeamSchema.safeParse(req.body);

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

    const updatedTeam = await db.orm.public.Team
      .where({
        id: team.id,
      })
      .update(parsed.data);

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TEAM_UPDATED",
      resource: "Team",
      resourceId: updatedTeam.id,
      metadata: {
        fields: Object.keys(parsed.data),
      },
      req,
    });

    return res.status(200).json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
}


export async function deleteTeam(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    await db.orm.public.Team
      .where({
        id: team.id,
      })
      .delete();

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TEAM_DELETED",
      resource: "Team",
      resourceId: team.id,
      metadata: {
        name: team.name,
      },
      req,
    });
    return res.status(200).json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}


export async function addTeamMember(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const { userId } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const user = await db.orm.public.User.first({
      id: userId,
      organizationId: req.organizationId,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const existingMember = await db.orm.public.TeamMember.first({
      teamId: team.id,
      userId: user.id,
    });

    if (existingMember) {
      return res.status(409).json({
        error: "User is already a member of this team",
      });
    }

    const member = await db.orm.public.TeamMember.create({
      teamId: team.id,
      userId: user.id,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TEAM_MEMBER_ADDED",
      resource: "Team",
      resourceId: team.id,
      metadata: {
        memberUserId: user.id,
      },
      req,
    });

    return res.status(201).json({
      message: "Team member added successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
}


export async function getTeamMembers(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const members = await db.orm.public.TeamMember
      .where({
        teamId: team.id,
      })
      .all();

    const users = [];

    for (const member of members) {
      const user = await db.orm.public.User.first({
        id: member.userId,
        organizationId: req.organizationId,
      });

      if (user) {
        users.push({
          membershipId: member.id,
          joinedAt: member.joinedAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    return res.status(200).json({
      team: {
        id: team.id,
        name: team.name,
      },
      members: users,
    });
  } catch (error) {
    next(error);
  }
}


export async function removeTeamMember(
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

    const team = await db.orm.public.Team.first({
      id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const { userId } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const member = await db.orm.public.TeamMember.first({
      teamId: team.id,
      userId,
    });

    if (!member) {
      return res.status(404).json({
        error: "Team member not found",
      });
    }

    await db.orm.public.TeamMember
      .where({
        id: member.id,
      })
      .delete();

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TEAM_MEMBER_REMOVED",
      resource: "Team",
      resourceId: team.id,
      metadata: {
        memberUserId: member.userId,
      },
      req,
    });

    return res.status(200).json({
      message: "Team member removed successfully",
    });
  } catch (error) {
    next(error);
  }
}