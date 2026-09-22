import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(100),

  organizationName: z
    .string()
    .trim()
    .min(1)
    .max(100),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(100),
});