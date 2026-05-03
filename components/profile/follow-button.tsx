"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { followUserAction, unfollowUserAction, type FollowActionState } from "@/lib/follows/actions";
import { Button } from "@/components/ui/button";

function Submit({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "…" : idle;
}

export function FollowButton({
  followingId,
  username,
  initialFollowing,
}: {
  followingId: string;
  username: string;
  initialFollowing: boolean;
}) {
  const [followState, followAction] = useActionState(followUserAction, null as FollowActionState);
  const [unfollowState, unfollowAction] = useActionState(unfollowUserAction, null as FollowActionState);

  const err = followState?.error ?? unfollowState?.error;

  return (
    <div className="flex flex-col gap-2">
      {initialFollowing ? (
        <form action={unfollowAction}>
          <input type="hidden" name="followingId" value={followingId} />
          <input type="hidden" name="username" value={username} />
          <Button type="submit" variant="outline" size="sm">
            <Submit idle="Unfollow" />
          </Button>
        </form>
      ) : (
        <form action={followAction}>
          <input type="hidden" name="followingId" value={followingId} />
          <input type="hidden" name="username" value={username} />
          <Button type="submit" size="sm">
            <Submit idle="Follow" />
          </Button>
        </form>
      )}
      {err ? (
        <p className="text-destructive text-xs" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
