import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(100),

  role: z.enum([
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ]),
});

export const updateUserSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    email: z
      .string()
      .trim()
      .email()
      .transform((value) =>
        value.toLowerCase()
      )
      .optional(),

    role: z
      .enum([
        "ADMIN",
        "PROJECT_MANAGER",
        "DEVELOPER",
      ])
      .optional(),
    password: z.string().min(8).max(100).optional(),
  });