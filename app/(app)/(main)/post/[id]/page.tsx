import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { PostCardActions } from "@/components/posts/post-card-actions";
import { PostReportForm } from "@/components/posts/post-report-form";
import { findAppUserBySupabaseId } from "@/lib/db/app-user";
import { listActiveCommentsForPost } from "@/lib/comments/queries";
import { getOptionalAuthUser } from "@/lib/auth/session";
import { getPostById } from "@/lib/posts/queries";
import { getViewerInteractionsForPosts } from "@/lib/posts/viewer-state";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

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

      <section>
        <h2 className="text-lg font-semibold tracking-tight">Comments</h2>
        <CommentList comments={comments} />
      </section>

      <CommentForm postId={post.id} />

      <PostReportForm postId={post.id} />
    </article>
  );
}
