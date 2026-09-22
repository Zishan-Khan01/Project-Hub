import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { db } from "../lib/prisma.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../schemas/taskSchema.js";

import { Temporal } from "@js-temporal/polyfill";
import { writeAuditLog } from "../utils/audit.js";


const uuidSchema = z.string().uuid();

export async function createTask(
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

    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
    } = parsed.data;

    const project = await db.orm.public.Project.first({
      id: projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(400).json({
        error: "Project not found in your organization",
      });
    }

    if (assigneeId) {
      const assignee = await db.orm.public.User.first({
        id: assigneeId,
        organizationId: req.organizationId,
      });

      if (!assignee) {
        return res.status(400).json({
          error: "Assignee not found in your organization",
        });
      }
    }

    const task = await db.orm.public.Task.create({
      title,
      description,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      dueDate: dueDate
        ? Temporal.Instant.from(dueDate)
        : undefined,
      projectId,
      assigneeId,
      createdById: req.userId,
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TASK_CREATED",
      resource: "Task",
      resourceId: task.id,
      metadata: {
        title: task.title,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
      },
      req,
    });
    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTasks(
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

    // Get projects belonging to this organization first.
    const projects = await db.orm.public.Project
      .where({
        organizationId: req.organizationId,
      })
      .all();

    const tasks = [];

    // Get tasks belonging to those projects.
    for (const project of projects) {
      const projectTasks = await db.orm.public.Task
        .where({
          projectId: project.id,
        })
        .all();

      tasks.push(...projectTasks);
    }

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!uuidSchema.safeParse(req.params.id).success) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    if (!req.organizationId) {
      return res.status(401).json({
        error: "Organization context missing",
      });
    }

    const task = await db.orm.public.Task.first({
      id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Verify that the task's project belongs to this organization.
    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
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
    const task = await db.orm.public.Task.first({
      id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Verify that the task belongs to a project
    // in the current organization.
    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const parsed = updateTaskSchema.safeParse(req.body);

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

    
    const previousStatus = task.status;
    const previousAssigneeId = task.assigneeId;
    if (data.assigneeId !== undefined) {
      const assignee = await db.orm.public.User.first({
        id: data.assigneeId,
        organizationId: req.organizationId,
      });

      if (!assignee) {
        return res.status(400).json({
          error: "Assignee not found in your organization",
        });
      }
    }

    const updateData = {
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? Temporal.Instant.from(data.dueDate)
          : undefined,
    };

    const updatedTask = await db.orm.public.Task
      .where({
        id: task.id,
      })
      .update(updateData);

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TASK_UPDATED",
      resource: "Task",
      resourceId: task.id,
      metadata: {
        fields: Object.keys(data),
      },
      req,
    });

    if (
      data.status !== undefined &&
      data.status !== previousStatus
    ) {
      await writeAuditLog({
        organizationId: req.organizationId,
        userId: req.userId,
        action: "TASK_STATUS_CHANGED",
        resource: "Task",
        resourceId: task.id,
        metadata: {
          previousStatus,
          newStatus: data.status,
        },
        req,
      });
    }

    if (
      data.assigneeId !== undefined &&
      data.assigneeId !== previousAssigneeId
    ) {
      await writeAuditLog({
        organizationId: req.organizationId,
        userId: req.userId,
        action: "TASK_ASSIGNED",
        resource: "Task",
        resourceId: task.id,
        metadata: {
          previousAssigneeId,
          newAssigneeId: data.assigneeId,
        },
        req,
      });
    }
    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
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
    const task = await db.orm.public.Task.first({
      id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Verify that the task belongs to a project
    // in the current organization.
    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "TASK_DELETED",
      resource: "Task",
      resourceId: task.id,
      metadata: {
        title: task.title,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
      },
      req,
    });

    await db.orm.public.Task
      .where({
        id: task.id,
      })
      .delete();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}