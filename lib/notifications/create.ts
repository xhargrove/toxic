import "server-only";

import { randomUUID } from "crypto";

import { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function notifyNewFollower(params: {
  recipientUserId: string;
  followerDisplayName: string;
  followerUsername: string;
}) {
  await prisma.notification.create({
    data: {
      id: randomUUID(),
      userId: params.recipientUserId,
      type: NotificationType.NEW_FOLLOWER,
      title: `${params.followerDisplayName} started following you`,
      body: `@${params.followerUsername}`,
      linkUrl: `/profile/${params.followerUsername}`,
    },
  });
}

export async function notifyPostUnderReview(params: { authorUserId: string; postId: string }) {
  await prisma.notification.create({
    data: {
      id: randomUUID(),
      userId: params.authorUserId,
      type: NotificationType.POST_UNDER_REVIEW,
      title: "Your post is under review",
      body: "It remains visible with a moderation banner; new votes, reactions, and comments are paused.",
      linkUrl: `/post/${params.postId}`,
    },
  });
}
