import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { db } from "../lib/prisma.js";
import { writeAuditLog } from "../utils/audit.js";

import {
  createCommentSchema,
  updateCommentSchema,
} from "../schemas/commentSchema.js";

const uuidSchema = z.string().uuid();

async function addCommentUser(comment: any, organizationId: string) {
  const user = await db.orm.public.User.first({
    id: comment.userId,
    organizationId,
  });

  return {
    ...comment,
    user: user
      ? {
          id: user.id,
          name: user.name,
        }
      : undefined,
  };
}

// CREATE COMMENT
export async function createComment(
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

    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const { content, taskId } = parsed.data;

    const task = await db.orm.public.Task.first({
      id: taskId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const comment = await db.orm.public.Comment.create({
      content,
      taskId,
      userId: req.userId,
    });

    const commentWithUser = await addCommentUser(
      comment,
      req.organizationId
    );

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "COMMENT_CREATED",
      resource: "Comment",
      resourceId: comment.id,
      metadata: {
        taskId: comment.taskId,
      },
      req,
    });

    return res.status(201).json({
      message: "Comment created successfully",
      comment: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
}

// GET ALL COMMENTS FOR A TASK
export async function getCommentsByTask(
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

    const { taskId } = req.params;

    if (!uuidSchema.safeParse(taskId).success) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const task = await db.orm.public.Task.first({
      id: taskId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const comments = await db.orm.public.Comment
      .where({
        taskId,
      })
      .all();

    const commentsWithUsers = await Promise.all(
      comments.map((comment) =>
        addCommentUser(comment, req.organizationId!)
      )
    );

    return res.status(200).json({
      comments: commentsWithUsers,
    });
  } catch (error) {
    next(error);
  }
}

// GET COMMENT BY ID
export async function getCommentById(
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

    const { id } = req.params;

    if (!uuidSchema.safeParse(id).success) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const comment = await db.orm.public.Comment.first({
      id,
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const task = await db.orm.public.Task.first({
      id: comment.taskId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const commentWithUser = await addCommentUser(
      comment,
      req.organizationId
    );

    return res.status(200).json({
      comment: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE COMMENT
export async function updateComment(
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

    const { id } = req.params;

    if (!uuidSchema.safeParse(id).success) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const comment = await db.orm.public.Comment.first({
      id,
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const task = await db.orm.public.Task.first({
      id: comment.taskId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    // Only the comment author can edit.
    if (comment.userId !== req.userId) {
      return res.status(403).json({
        error: "You can only update your own comments",
      });
    }

    const parsed = updateCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsed.error.flatten(),
      });
    }

    const updatedComment = await db.orm.public.Comment
      .where({
        id: comment.id,
      })
      .update({
        content: parsed.data.content,
      });

    const commentWithUser = await addCommentUser(
      updatedComment,
      req.organizationId
    );

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "COMMENT_UPDATED",
      resource: "Comment",
      resourceId: comment.id,
      metadata: {
        fields: ["content"],
      },
      req,
    });

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE COMMENT
export async function deleteComment(
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

    const { id } = req.params;

    if (!uuidSchema.safeParse(id).success) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const comment = await db.orm.public.Comment.first({
      id,
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const task = await db.orm.public.Task.first({
      id: comment.taskId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const project = await db.orm.public.Project.first({
      id: task.projectId,
      organizationId: req.organizationId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    // Get the authenticated user's role.
    const user = await db.orm.public.User.first({
      id: req.userId,
      organizationId: req.organizationId,
    });

    if (!user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    // Author can delete their own comment.
    // Admin can delete any comment in their organization.
    if (
      comment.userId !== req.userId &&
      user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "You can only delete your own comments",
      });
    }

    await writeAuditLog({
      organizationId: req.organizationId,
      userId: req.userId,
      action: "COMMENT_DELETED",
      resource: "Comment",
      resourceId: comment.id,
      metadata: {
        taskId: comment.taskId,
        userId: comment.userId,
      },
      req,
    });

    await db.orm.public.Comment
      .where({
        id: comment.id,
      })
      .delete();

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}