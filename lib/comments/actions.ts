"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { ContentStatus } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { getActivePostForMutations } from "@/lib/interactions/post-for-actions";
import { prisma } from "@/lib/db/prisma";
import { commentBodySchema, parsePostIdParam } from "@/lib/validation/interactions";

export type CommentActionState = {
  error?: string;
  fieldErrors?: { body?: string[] };
} | null;

export async function createCommentAction(_prev: CommentActionState, formData: FormData): Promise<CommentActionState> {
  const postId = parsePostIdParam(formData.get("postId"));
  if (!postId) {
    return { error: "Invalid or missing post." };
  }

  const dbUser = await requireCompleteProfile(`/post/${postId}`);

  const parsed = commentBodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    return {
      fieldErrors: { body: [parsed.error.issues[0]?.message ?? "Invalid comment."] },
    };
  }

  const post = await getActivePostForMutations(postId);
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
  revalidatePath(`/city/${post.citySlug}`);
  return null;
}
