import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional(),
  teamId: z.string().uuid().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();