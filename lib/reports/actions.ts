"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { ContentStatus, ReportStatus } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";
import { reportPostSchema } from "@/lib/validation/interactions";

export type ReportPostState = { error?: string; ok?: boolean } | null;

function reportReviewThreshold(): number {
  const raw = process.env.REPORT_POST_REVIEW_THRESHOLD;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
}

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
  revalidatePath("/admin");
}

export async function reportPostAction(_prev: ReportPostState, formData: FormData): Promise<ReportPostState> {
  const postIdRaw = formData.get("postId");
  const postId = typeof postIdRaw === "string" ? postIdRaw : "";
  const dbUser = await requireCompleteProfile(`/post/${postId || "unknown"}`);

  const parsed = reportPostSchema.safeParse({
    reason: formData.get("reason"),
    details: formData.get("details"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report." };
  }

  if (!postId) {
    return { error: "Missing post." };
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      status: { in: [ContentStatus.ACTIVE, ContentStatus.UNDER_REVIEW] },
    },
    select: { id: true, status: true },
  });
  if (!post) {
    return { error: "This post cannot be reported." };
  }

  const duplicateOpen = await prisma.report.findFirst({
    where: {
      reporterId: dbUser.id,
      postId,
      status: ReportStatus.OPEN,
    },
    select: { id: true },
  });
  if (duplicateOpen) {
    return { error: "You already have an open report for this post." };
  }

  await prisma.report.create({
    data: {
      id: randomUUID(),
      reporterId: dbUser.id,
      postId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      status: ReportStatus.OPEN,
    },
  });

  const openCount = await prisma.report.count({
    where: { postId, status: ReportStatus.OPEN },
  });

  if (post.status === ContentStatus.ACTIVE && openCount >= reportReviewThreshold()) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: ContentStatus.UNDER_REVIEW,
        updatedAt: new Date(),
      },
    });
  }

  await revalidatePostPaths(postId);
  return { ok: true };
}
