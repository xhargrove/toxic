import Link from "next/link";

import { listTrendingPosts } from "@/lib/posts/queries";

export default async function TrendingPage() {
  const posts = await listTrendingPosts(25);

  return (
    <section className="flex flex-col gap-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Trending</h1>
      <p className="text-muted-foreground text-sm">
        Sorted by reaction count, then newest (see `listTrendingPosts`).
      </p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing trending yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.id} className="border-border rounded-lg border p-4">
              <Link href={`/post/${p.id}`} className="text-lg font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{p.body}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                Reactions {p.reactionCount} · {p.User.username} · {p.City.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
