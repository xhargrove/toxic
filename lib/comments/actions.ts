"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { ContentStatus } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";
import { commentBodySchema } from "@/lib/validation/interactions";

export type CommentActionState = {
  error?: string;
  fieldErrors?: { body?: string[] };
} | null;

async function assertInteractablePost(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      status: ContentStatus.ACTIVE,
    },
    select: { id: true, City: { select: { slug: true } } },
  });
  return post;
}

export async function createCommentAction(_prev: CommentActionState, formData: FormData): Promise<CommentActionState> {
  const postIdRaw = formData.get("postId");
  const postId = typeof postIdRaw === "string" ? postIdRaw : "";
  const dbUser = await requireCompleteProfile(`/post/${postId || "unknown"}`);

  const parsed = commentBodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    return {
      fieldErrors: { body: [parsed.error.issues[0]?.message ?? "Invalid comment."] },
    };
  }

  if (!postId) {
    return { error: "Missing post." };
  }

  const post = await assertInteractablePost(postId);
  if (!post) {
    return { error: "This post is not available for comments." };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.comment.create({
      data: {
        id: randomUUID(),
        postId,
        authorId: dbUser.id,
        body: parsed.data,
        updatedAt: now,
        status: ContentStatus.ACTIVE,
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: { increment: 1 },
        updatedAt: now,
      },
    }),
  ]);

  revalidatePath("/home");
  revalidatePath("/trending");
  revalidatePath(`/post/${postId}`);
  revalidatePath(`/city/${post.City.slug}`);
  return null;
}
