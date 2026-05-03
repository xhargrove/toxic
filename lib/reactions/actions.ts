"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { getActivePostForMutations } from "@/lib/interactions/post-for-actions";
import { prisma } from "@/lib/db/prisma";
import { parsePostIdParam, reactionTypeSchema } from "@/lib/validation/interactions";

export type ReactionActionState = { error?: string } | null;

async function revalidatePostPaths(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { City: { select: { slug: true } } },
  });
  if (!post) {
    return;
  }
  revalidatePath("/home");
  revalidatePath("/trending");
  revalidatePath(`/post/${postId}`);
  revalidatePath(`/city/${post.City.slug}`);
}

export async function toggleReactionAction(
  _prev: ReactionActionState,
  formData: FormData
): Promise<ReactionActionState> {
  const postId = parsePostIdParam(formData.get("postId"));
  if (!postId) {
    return { error: "Invalid or missing post." };
  }

  const dbUser = await requireCompleteProfile(`/post/${postId}`);

  const parsedType = reactionTypeSchema.safeParse(formData.get("reactionType"));
  if (!parsedType.success) {
    return { error: "Invalid reaction." };
  }
  const reactionType = parsedType.data;

  const post = await getActivePostForMutations(postId);
  if (!post) {
    return { error: "Post not available for reactions." };
  }

  const existing = await prisma.reaction.findFirst({
    where: { postId, userId: dbUser.id, reactionType },
  });

  const now = new Date();

  try {
    if (existing) {
      await prisma.$transaction([
        prisma.reaction.delete({ where: { id: existing.id } }),
        prisma.post.update({
          where: { id: postId },
          data: {
            reactionCount: { decrement: 1 },
            updatedAt: now,
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.reaction.create({
          data: {
            id: randomUUID(),
            postId,
            userId: dbUser.id,
            reactionType,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            reactionCount: { increment: 1 },
            updatedAt: now,
          },
        }),
      ]);
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "You already reacted with this type." };
    }
    throw e;
  }

  await revalidatePostPaths(postId);
  return null;
}
