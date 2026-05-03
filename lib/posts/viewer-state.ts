import type { ReactionType, VoteType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type ViewerPostInteractions = {
  vote: VoteType | null;
  reactions: ReactionType[];
};

/**
 * Batch-load current user's vote + reactions for feed cards (keys missing when no rows).
 */
export async function getViewerInteractionsForPosts(
  userId: string,
  postIds: string[]
): Promise<Record<string, ViewerPostInteractions>> {
  const empty = (): ViewerPostInteractions => ({ vote: null, reactions: [] });
  const map: Record<string, ViewerPostInteractions> = {};
  for (const id of postIds) {
    map[id] = empty();
  }
  if (postIds.length === 0) {
    return map;
  }

  const [votes, reactions] = await Promise.all([
    prisma.vote.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true, voteType: true },
    }),
    prisma.reaction.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true, reactionType: true },
    }),
  ]);

  for (const v of votes) {
    map[v.postId] ??= empty();
    map[v.postId].vote = v.voteType;
  }
  for (const r of reactions) {
    map[r.postId] ??= empty();
    map[r.postId].reactions.push(r.reactionType);
  }

  return map;
}
