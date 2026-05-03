import { ContentStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

const commentAuthor = {
  select: {
    username: true,
    displayName: true,
    avatarUrl: true,
  },
} as const;

export async function listActiveCommentsForPost(postId: string) {
  return prisma.comment.findMany({
    where: {
      postId,
      status: ContentStatus.ACTIVE,
      parentCommentId: null,
    },
    orderBy: { createdAt: "asc" },
    include: { User: commentAuthor },
  });
}
