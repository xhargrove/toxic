import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowButton } from "@/components/profile/follow-button";
import { findAppUserBySupabaseId } from "@/lib/db/app-user";
import { getFollowCounts, isFollowing } from "@/lib/follows/queries";
import { getOptionalAuthUser } from "@/lib/auth/session";
import { listPostsForAuthor } from "@/lib/posts/queries";
import { getUserProfileByUsername } from "@/lib/users/queries";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserProfileByUsername(username);

  if (!user) {
    notFound();
  }

  const posts = await listPostsForAuthor(user.id, 30);
  const { followers, following } = await getFollowCounts(user.id);

  const auth = await getOptionalAuthUser();
  let showFollow = false;
  let initialFollowing = false;
  if (auth?.id) {
    const viewer = await findAppUserBySupabaseId(auth.id);
    if (viewer && viewer.id !== user.id) {
      showFollow = true;
      initialFollowing = await isFollowing(viewer.id, user.id);
    }
  }

  return (
    <section className="flex flex-col gap-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.displayName}</h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            {followers} followers · {following} following
          </p>
          {user.bio ? <p className="mt-3 max-w-xl text-sm">{user.bio}</p> : null}
        </div>
        {showFollow ? (
          <FollowButton followingId={user.id} username={user.username} initialFollowing={initialFollowing} />
        ) : null}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No public posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/post/${p.id}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
                <p className="text-muted-foreground line-clamp-2 text-sm">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
