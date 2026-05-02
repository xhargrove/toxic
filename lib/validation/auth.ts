import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed");

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const signUpSchema = loginSchema.extend({
  username: usernameSchema,
});
