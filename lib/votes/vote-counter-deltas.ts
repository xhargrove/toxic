import { VoteType } from "@prisma/client";

export type VoteAdjustmentMode = "create" | "delete" | "switch";

/**
 * Pure counter deltas for `Post.capCount` / `factsCount` after a vote mutation.
 * Aligned with `@@unique([postId, userId])` — at most one vote row per user per post.
 */
export function voteCounterAdjustments(
  existingVote: VoteType | null,
  clickedVote: VoteType
): { mode: VoteAdjustmentMode; capDelta: number; factsDelta: number } {
  if (!existingVote) {
    return {
      mode: "create",
      capDelta: clickedVote === VoteType.CAP ? 1 : 0,
      factsDelta: clickedVote === VoteType.FACTS ? 1 : 0,
    };
  }

  if (existingVote === clickedVote) {
    return {
      mode: "delete",
      capDelta: existingVote === VoteType.CAP ? -1 : 0,
      factsDelta: existingVote === VoteType.FACTS ? -1 : 0,
    };
  }

  return {
    mode: "switch",
    capDelta: existingVote === VoteType.CAP ? -1 : 1,
    factsDelta: existingVote === VoteType.FACTS ? -1 : 1,
  };
}
