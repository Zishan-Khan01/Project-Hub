import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateTeamSchema = createTeamSchema.partial();