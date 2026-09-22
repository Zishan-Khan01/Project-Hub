import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(5000),

  taskId: z
    .string()
    .uuid(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(5000),
});