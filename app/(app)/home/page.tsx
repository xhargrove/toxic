import Link from "next/link";

import { listHomePosts } from "@/lib/posts/queries";

export default async function HomePage() {
  const posts = await listHomePosts(25);

  return (
    <section className="flex flex-col gap-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      <p className="text-muted-foreground text-sm">Latest public posts (newest first).</p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts yet. Create one from the nav.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.id} className="border-border rounded-lg border p-4">
              <Link href={`/post/${p.id}`} className="text-lg font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{p.body}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {p.User.username} · {p.City.name} · {new Date(p.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
