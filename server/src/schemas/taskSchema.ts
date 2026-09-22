import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  status: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),

  projectId: z
    .string()
    .uuid(),

  assigneeId: z
    .string()
    .uuid()
    .optional(),
});

export const updateTaskSchema = createTaskSchema
  .omit({
    projectId: true,
  })
  .partial();