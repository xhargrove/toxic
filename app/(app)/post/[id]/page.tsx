import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostById } from "@/lib/posts/queries";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
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
      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </article>
  );
}
