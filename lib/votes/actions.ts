"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { ContentStatus, VoteType } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";
import { voteTypeSchema } from "@/lib/validation/interactions";

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
  const postIdRaw = formData.get("postId");
  const postId = typeof postIdRaw === "string" ? postIdRaw : "";
  const dbUser = await requireCompleteProfile(`/post/${postId || "unknown"}`);

  const parsedType = voteTypeSchema.safeParse(formData.get("voteType"));
  if (!parsedType.success) {
    return { error: "Invalid vote type." };
  }
  const voteType = parsedType.data;

  if (!postId) {
    return { error: "Missing post." };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, status: ContentStatus.ACTIVE },
    select: { id: true },
  });
  if (!post) {
    return { error: "Post not available." };
  }

  const existing = await prisma.vote.findUnique({
    where: { postId_userId: { postId, userId: dbUser.id } },
  });

  const now = new Date();

  if (!existing) {
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
          ...(voteType === VoteType.CAP
            ? { capCount: { increment: 1 } }
            : { factsCount: { increment: 1 } }),
          updatedAt: now,
        },
      }),
    ]);
    await revalidatePostPaths(postId);
    return null;
  }

  if (existing.voteType === voteType) {
    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: {
          ...(voteType === VoteType.CAP
            ? { capCount: { decrement: 1 } }
            : { factsCount: { decrement: 1 } }),
          updatedAt: now,
        },
      }),
    ]);
    await revalidatePostPaths(postId);
    return null;
  }

  await prisma.$transaction([
    prisma.vote.update({
      where: { id: existing.id },
      data: { voteType, updatedAt: now },
    }),
    prisma.post.update({
      where: { id: postId },
      data: {
        capCount: { increment: existing.voteType === VoteType.CAP ? -1 : 1 },
        factsCount: { increment: existing.voteType === VoteType.FACTS ? -1 : 1 },
        updatedAt: now,
      },
    }),
  ]);

  await revalidatePostPaths(postId);
  return null;
}
