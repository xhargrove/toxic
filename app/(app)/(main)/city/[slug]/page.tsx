import Link from "next/link";
import { notFound } from "next/navigation";

import { listPostsForCity } from "@/lib/posts/queries";
import { getCityBySlug } from "@/lib/cities/queries";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);

  if (!city || !city.isActive) {
    notFound();
  }

  const posts = await listPostsForCity(city.id, 30);

  return (
    <section className="flex flex-col gap-8 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{city.name}</h1>
        <p className="text-muted-foreground text-sm">
          {city.state}, {city.country}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts in this city yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((p) => (
              <li key={p.id} className="border-border rounded-lg border p-3">
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
