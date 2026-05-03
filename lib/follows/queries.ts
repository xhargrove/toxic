import { prisma } from "@/lib/db/prisma";

export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.userFollow.count({ where: { followingId: userId } }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

export async function isFollowing(viewerId: string, targetUserId: string) {
  if (viewerId === targetUserId) {
    return false;
  }
  const row = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId: viewerId, followingId: targetUserId },
    },
    select: { id: true },
  });
  return Boolean(row);
}
