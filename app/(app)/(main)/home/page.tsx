import { PostCard } from "@/components/posts/post-card";
import { findAppUserBySupabaseId } from "@/lib/db/app-user";
import { getOptionalAuthUser } from "@/lib/auth/session";
import { listHomePosts } from "@/lib/posts/queries";
import { getViewerInteractionsForPosts } from "@/lib/posts/viewer-state";

export default async function HomePage() {
  const posts = await listHomePosts(25);

  const auth = await getOptionalAuthUser();
  let viewerByPost: Awaited<ReturnType<typeof getViewerInteractionsForPosts>> = {};
  if (auth?.id) {
    const userRow = await findAppUserBySupabaseId(auth.id);
    if (userRow && posts.length > 0) {
      viewerByPost = await getViewerInteractionsForPosts(
        userRow.id,
        posts.map((p) => p.id)
      );
    }
  }

  return (
    <section className="flex flex-col gap-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      <p className="text-muted-foreground text-sm">Latest public posts (newest first).</p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts yet. Create one from the nav.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} viewer={viewerByPost[p.id] ?? null} />
          ))}
        </ul>
      )}
    </section>
  );
}
