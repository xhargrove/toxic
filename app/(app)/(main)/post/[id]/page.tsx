import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { PostCardActions } from "@/components/posts/post-card-actions";
import { PostReportForm } from "@/components/posts/post-report-form";
import { findAppUserBySupabaseId } from "@/lib/db/app-user";
import { listActiveCommentsForPost } from "@/lib/comments/queries";
import { getOptionalAuthUser } from "@/lib/auth/session";
import { getPublicPostById } from "@/lib/posts/queries";
import { getViewerInteractionsForPosts } from "@/lib/posts/viewer-state";
import { ContentStatus } from "@prisma/client";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPublicPostById(id);

  if (!post) {
    notFound();
  }

  const restricted = post.status === ContentStatus.UNDER_REVIEW;

  const comments = await listActiveCommentsForPost(id);

  const auth = await getOptionalAuthUser();
  let viewer = null;
  if (auth?.id) {
    const userRow = await findAppUserBySupabaseId(auth.id);
    if (userRow) {
      const map = await getViewerInteractionsForPosts(userRow.id, [id]);
      viewer = map[id] ?? null;
    }
  }

  return (
    <article className="flex flex-col gap-4 py-12">
      <Link href="/home" className="text-muted-foreground text-sm hover:underline">
        ← Back to home
      </Link>

      {restricted ? (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
          role="status"
        >
          <p className="font-medium">Under moderation review</p>
          <p className="mt-1 text-amber-950/90 dark:text-amber-100/90">
            This post stays visible, but new votes, reactions, and comments are paused until moderation finishes.
          </p>
        </div>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="text-muted-foreground text-sm">
        <Link href={`/profile/${post.User.username}`} className="hover:underline">
          {post.User.displayName}
        </Link>{" "}
        ·{" "}
        <Link href={`/city/${post.City.slug}`} className="hover:underline">
          {post.City.name}
        </Link>{" "}
        · {new Date(post.createdAt).toLocaleString()}
      </p>
      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">{post.body}</div>

      {!restricted ? (
        <PostCardActions
          postId={post.id}
          counts={{
            reactionCount: post.reactionCount,
            capCount: post.capCount,
            factsCount: post.factsCount,
            commentCount: post.commentCount,
          }}
          viewer={viewer}
          variant="detail"
        />
      ) : (
        <p className="text-muted-foreground border-t pt-4 text-sm">
          Voting and reactions are disabled while this post is under review ({post.reactionCount} reactions ·{" "}
          {post.commentCount} comments · Cap {post.capCount} · Facts {post.factsCount}).
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold tracking-tight">Comments</h2>
        <CommentList comments={comments} />
      </section>

      <CommentForm postId={post.id} disabled={restricted} />

      <PostReportForm postId={post.id} />
    </article>
  );
}
