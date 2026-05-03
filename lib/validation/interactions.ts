import { z } from "zod";

import { ReactionType, VoteType } from "@prisma/client";

/** Prisma `cuid()` ids used as primary keys (typical length 25). */
export const postIdSchema = z
  .string()
  .trim()
  .min(20)
  .max(36)
  .regex(/^[a-z0-9]+$/i);

export function parsePostIdParam(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const raw = typeof value === "string" ? value : String(value);
  const p = postIdSchema.safeParse(raw);
  return p.success ? p.data : null;
}

export const commentBodySchema = z.string().trim().min(1).max(8_000);

export const voteTypeSchema = z.nativeEnum(VoteType);

export const reactionTypeSchema = z.nativeEnum(ReactionType);

export const reportPostSchema = z.object({
  reason: z.string().trim().min(3).max(120),
  details: z
    .string()
    .trim()
    .max(4_000)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
});
