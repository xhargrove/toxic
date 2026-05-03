import "server-only";

import { ContentStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { parsePostIdParam } from "@/lib/validation/interactions";

/** Comments, votes, reactions: only `ACTIVE` posts (not UNDER_REVIEW / REMOVED). */
export async function getActivePostForMutations(rawPostId: unknown) {
  const postId = parsePostIdParam(rawPostId);
  if (!postId) {
    return null;
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      status: ContentStatus.ACTIVE,
    },
    select: {
      id: true,
      City: { select: { slug: true } },
    },
  });

  if (!post) {
    return null;
  }

  return { id: post.id, citySlug: post.City.slug };
}

/** Reports: ACTIVE (first reports) or UNDER_REVIEW (additional reporters); never REMOVED. */
export async function getPostTargetForReport(rawPostId: unknown) {
  const postId = parsePostIdParam(rawPostId);
  if (!postId) {
    return null;
  }

  return prisma.post.findFirst({
    where: {
      id: postId,
      status: { in: [ContentStatus.ACTIVE, ContentStatus.UNDER_REVIEW] },
    },
    select: { id: true, status: true, authorId: true },
  });
}
