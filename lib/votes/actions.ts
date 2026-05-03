"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { getActivePostForMutations } from "@/lib/interactions/post-for-actions";
import { prisma } from "@/lib/db/prisma";
import { parsePostIdParam, voteTypeSchema } from "@/lib/validation/interactions";
import { voteCounterAdjustments } from "@/lib/votes/vote-counter-deltas";

export type VoteActionState = { error?: string } | null;

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

export async function setVoteAction(_prev: VoteActionState, formData: FormData): Promise<VoteActionState> {
  const postId = parsePostIdParam(formData.get("postId"));
  if (!postId) {
    return { error: "Invalid or missing post." };
  }

  const dbUser = await requireCompleteProfile(`/post/${postId}`);

  const parsedType = voteTypeSchema.safeParse(formData.get("voteType"));
  if (!parsedType.success) {
    return { error: "Invalid vote type." };
  }
  const voteType = parsedType.data;

  const post = await getActivePostForMutations(postId);
  if (!post) {
    return { error: "Post not available for voting." };
  }

  const existing = await prisma.vote.findUnique({
    where: { postId_userId: { postId, userId: dbUser.id } },
  });

  const adj = voteCounterAdjustments(existing?.voteType ?? null, voteType);
  const now = new Date();

  if (adj.mode === "create") {
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          id: randomUUID(),
          postId,
          userId: dbUser.id,
          voteType,
          updatedAt: now,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          capCount: { increment: adj.capDelta },
          factsCount: { increment: adj.factsDelta },
          updatedAt: now,
        },
      }),
    ]);
  } else if (adj.mode === "delete") {
    if (!existing) {
      return { error: "Vote state out of sync. Refresh and try again." };
    }
    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: {
          capCount: { increment: adj.capDelta },
          factsCount: { increment: adj.factsDelta },
          updatedAt: now,
        },
      }),
    ]);
  } else {
    if (!existing) {
      return { error: "Vote state out of sync. Refresh and try again." };
    }
    await prisma.$transaction([
      prisma.vote.update({
        where: { id: existing.id },
        data: { voteType, updatedAt: now },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          capCount: { increment: adj.capDelta },
          factsCount: { increment: adj.factsDelta },
          updatedAt: now,
        },
      }),
    ]);
  }

  await revalidatePostPaths(postId);
  return null;
}
