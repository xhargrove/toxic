import { ContentStatus, Visibility } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

const publicLive = {
  status: ContentStatus.ACTIVE,
  visibility: Visibility.PUBLIC,
} as const;

const postInclude = {
  User: { select: { username: true, displayName: true } },
  City: { select: { name: true, slug: true } },
  Category: { select: { name: true, slug: true } },
} as const;

export async function listHomePosts(limit = 20) {
  return prisma.post.findMany({
    where: publicLive,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: postInclude,
  });
}

/** Trending: reaction engagement then recency (same schema indices support `cityId, status, visibility, createdAt`). */
export async function listTrendingPosts(limit = 20) {
  return prisma.post.findMany({
    where: publicLive,
    orderBy: [{ reactionCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: postInclude,
  });
}

export async function getPostById(id: string) {
  return prisma.post.findFirst({
    where: { id, ...publicLive },
    include: postInclude,
  });
}

export async function listPostsForCity(cityId: string, limit = 30) {
  return prisma.post.findMany({
    where: { cityId, ...publicLive },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: postInclude,
  });
}

export async function listPostsForAuthor(authorId: string, limit = 30) {
  return prisma.post.findMany({
    where: { authorId, ...publicLive },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: postInclude,
  });
}

export async function listModerationQueue(limit = 50) {
  return prisma.post.findMany({
    where: { status: ContentStatus.UNDER_REVIEW },
    orderBy: { updatedAt: "asc" },
    take: limit,
    include: postInclude,
  });
}
