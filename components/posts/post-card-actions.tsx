"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ReactionType, VoteType } from "@prisma/client";
import { AlertTriangle, Eye, Flame, Laugh, Zap } from "lucide-react";

import { setVoteAction, type VoteActionState } from "@/lib/votes/actions";
import { toggleReactionAction, type ReactionActionState } from "@/lib/reactions/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ViewerPostInteractions } from "@/lib/posts/viewer-state";

function VoteSubmit({
  postId,
  voteType,
  label,
  count,
  active,
}: {
  postId: string;
  voteType: VoteType;
  label: string;
  count: number;
  active: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="voteType" value={voteType} />
      <Button
        type="submit"
        variant={active ? "default" : "outline"}
        size="xs"
        disabled={pending}
        className="gap-1"
        aria-pressed={active}
      >
        {label}
        <span className="text-muted-foreground tabular-nums">({count})</span>
      </Button>
    </>
  );
}

function ReactionIcon({ rt }: { rt: ReactionType }) {
  const cls = "size-3.5 shrink-0";
  switch (rt) {
    case ReactionType.FIRE:
      return <Flame className={cls} aria-hidden />;
    case ReactionType.LAUGH:
      return <Laugh className={cls} aria-hidden />;
    case ReactionType.SHOCKED:
      return <Zap className={cls} aria-hidden />;
    case ReactionType.EYES:
      return <Eye className={cls} aria-hidden />;
    case ReactionType.WARNING:
      return <AlertTriangle className={cls} aria-hidden />;
    default:
      return null;
  }
}

function ReactionSubmit({
  postId,
  reactionType,
  active,
  label,
}: {
  postId: string;
  reactionType: ReactionType;
  active: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="reactionType" value={reactionType} />
      <Button
        type="submit"
        variant={active ? "secondary" : "outline"}
        size="xs"
        disabled={pending}
        className="gap-1"
        aria-pressed={active}
        aria-label={label}
      >
        <ReactionIcon rt={reactionType} />
        <span className={cn("hidden sm:inline")}>{label}</span>
      </Button>
    </>
  );
}

const FEED_REACTIONS: ReactionType[] = [
  ReactionType.FIRE,
  ReactionType.LAUGH,
  ReactionType.SHOCKED,
];

const DETAIL_REACTIONS: ReactionType[] = [
  ReactionType.LAUGH,
  ReactionType.SHOCKED,
  ReactionType.FIRE,
  ReactionType.EYES,
  ReactionType.WARNING,
];

const reactionLabel: Record<ReactionType, string> = {
  [ReactionType.LAUGH]: "Laugh",
  [ReactionType.SHOCKED]: "Shocked",
  [ReactionType.FIRE]: "Fire",
  [ReactionType.EYES]: "Eyes",
  [ReactionType.WARNING]: "Warning",
};

export function PostCardActions({
  postId,
  counts,
  viewer,
  variant = "feed",
}: {
  postId: string;
  counts: {
    reactionCount: number;
    capCount: number;
    factsCount: number;
    commentCount: number;
  };
  viewer: ViewerPostInteractions | null;
  variant?: "feed" | "detail";
}) {
  const reactions = variant === "detail" ? DETAIL_REACTIONS : FEED_REACTIONS;
  const [voteState, voteAction] = useActionState(setVoteAction, null as VoteActionState);
  const [reactionState, reactionAction] = useActionState(toggleReactionAction, null as ReactionActionState);

  const myVote = viewer?.vote ?? null;
  const myReactions = viewer?.reactions ?? [];

  const interactionError = voteState?.error ?? reactionState?.error;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t pt-3">
      {interactionError ? (
        <p className="text-destructive text-xs" role="alert">
          {interactionError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">Vote</span>
        <form action={voteAction} className="inline-flex">
          <VoteSubmit
            postId={postId}
            voteType={VoteType.CAP}
            label="Cap"
            count={counts.capCount}
            active={myVote === VoteType.CAP}
          />
        </form>
        <form action={voteAction} className="inline-flex">
          <VoteSubmit
            postId={postId}
            voteType={VoteType.FACTS}
            label="Facts"
            count={counts.factsCount}
            active={myVote === VoteType.FACTS}
          />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">React</span>
        {reactions.map((rt) => {
          const active = myReactions.includes(rt);
          return (
            <form key={rt} action={reactionAction} className="inline-flex">
              <ReactionSubmit
                postId={postId}
                reactionType={rt}
                active={active}
                label={reactionLabel[rt]}
              />
            </form>
          );
        })}
        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
          {counts.reactionCount} reactions · {counts.commentCount} comments
        </span>
      </div>
    </div>
  );
}
