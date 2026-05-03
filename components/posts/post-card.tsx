import Link from "next/link";

import type { listHomePosts, listTrendingPosts } from "@/lib/posts/queries";
import type { ViewerPostInteractions } from "@/lib/posts/viewer-state";

import { PostCardActions } from "@/components/posts/post-card-actions";

export type FeedPost =
  | Awaited<ReturnType<typeof listHomePosts>>[number]
  | Awaited<ReturnType<typeof listTrendingPosts>>[number];

export function PostCard({
  post,
  viewer,
}: {
  post: FeedPost;
  viewer: ViewerPostInteractions | null;
}) {
  return (
    <li className="border-border rounded-lg border p-4">
      <Link href={`/post/${post.id}`} className="text-lg font-medium hover:underline">
        {post.title}
      </Link>
      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{post.body}</p>
      <p className="text-muted-foreground mt-2 text-xs">
        {post.User.username} · {post.City.name} · {new Date(post.createdAt).toLocaleString()}
      </p>
      <PostCardActions
        postId={post.id}
        counts={{
          reactionCount: post.reactionCount,
          capCount: post.capCount,
          factsCount: post.factsCount,
          commentCount: post.commentCount,
        }}
        viewer={viewer}
        variant="feed"
      />
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <Link
          href={`/post/${post.id}#report`}
          className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Report
        </Link>
        {!viewer ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/post/${post.id}`)}`}
            className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Sign in to interact
          </Link>
        ) : null}
      </div>
    </li>
  );
}
