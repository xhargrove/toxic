import { z } from "zod";

import { ReactionType, VoteType } from "@prisma/client";

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
