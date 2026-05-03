"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { ContentStatus, Prisma, ReportStatus } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { getPostTargetForReport } from "@/lib/interactions/post-for-actions";
import { notifyPostUnderReview } from "@/lib/notifications/create";
import { prisma } from "@/lib/db/prisma";
import { shouldEscalatePostToReview } from "@/lib/reports/threshold-logic";
import { parsePostIdParam, reportPostSchema } from "@/lib/validation/interactions";

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
  const postId = parsePostIdParam(formData.get("postId"));
  if (!postId) {
    return { error: "Invalid or missing post." };
  }

  const parsed = reportPostSchema.safeParse({
    reason: formData.get("reason"),
    details: formData.get("details"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report." };
  }

  const dbUser = await requireCompleteProfile(`/post/${postId}`);

  const post = await getPostTargetForReport(postId);
  if (!post) {
    return { error: "This post cannot be reported." };
  }

  try {
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
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "You already have an open report for this post." };
    }
    throw e;
  }

  const openCount = await prisma.report.count({
    where: { postId, status: ReportStatus.OPEN },
  });

  const threshold = reportReviewThreshold();
  if (
    shouldEscalatePostToReview({
      postStatus: post.status,
      openReportCount: openCount,
      threshold,
    })
  ) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: ContentStatus.UNDER_REVIEW,
        updatedAt: new Date(),
      },
    });

    await notifyPostUnderReview({
      authorUserId: post.authorId,
      postId,
    });

    revalidatePath("/notifications");
  }

  await revalidatePostPaths(postId);
  return { ok: true };
}
