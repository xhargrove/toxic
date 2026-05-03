import type { listActiveCommentsForPost } from "@/lib/comments/queries";

type CommentRow = Awaited<ReturnType<typeof listActiveCommentsForPost>>[number];

export function CommentList({
  comments,
}: {
  comments: CommentRow[];
}) {
  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-sm" data-testid="comments-empty">
        No comments yet. Be the first to reply.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4 border-t pt-6">
      {comments.map((c) => (
        <li key={c.id} className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3">
          <p className="text-sm whitespace-pre-wrap">{c.body}</p>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium text-foreground">{c.User.displayName}</span> · @{c.User.username} ·{" "}
            {new Date(c.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
