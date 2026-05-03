"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createCommentAction, type CommentActionState } from "@/lib/comments/actions";
import { Button } from "@/components/ui/button";

function SubmitLabel({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Posting…" : idle;
}

const inputClass =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export function CommentForm({ postId }: { postId: string }) {
  const [state, action] = useActionState(createCommentAction, null as CommentActionState);

  return (
    <form action={action} className="flex flex-col gap-3 border-t pt-6">
      <h2 className="text-lg font-semibold tracking-tight">Add a comment</h2>
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor={`comment-body-${postId}`} className="sr-only">
        Comment
      </label>
      <textarea
        id={`comment-body-${postId}`}
        name="body"
        required
        rows={4}
        placeholder="Write something constructive…"
        className={inputClass}
        aria-invalid={Boolean(state?.fieldErrors?.body)}
        minLength={1}
        maxLength={8000}
      />
      {state?.fieldErrors?.body?.[0] ? (
        <p className="text-destructive text-xs" role="alert">
          {state.fieldErrors.body[0]}
        </p>
      ) : null}
      {state?.error ? (
        <p className="text-destructive text-xs" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="sm" className="w-fit">
        <SubmitLabel idle="Post comment" />
      </Button>
    </form>
  );
}
