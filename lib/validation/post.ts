import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(5).max(180),
  body: z.string().min(20).max(10_000),
  citySlug: z.string().min(2).max(100),
});
