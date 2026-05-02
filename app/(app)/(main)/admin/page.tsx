import { removePostFromReview } from "@/lib/moderation/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listModerationQueue } from "@/lib/posts/queries";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  await requireAdmin("/admin");
  const queue = await listModerationQueue(50);

  return (
    <section className="flex flex-col gap-8 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Posts with status <code className="text-foreground">UNDER_REVIEW</code>. Removing sets status to{" "}
          <code className="text-foreground">REMOVED</code>.
        </p>
      </div>

      {queue.length === 0 ? (
        <p className="text-muted-foreground text-sm">Queue is empty.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {queue.map((p) => (
            <li key={p.id} className="border-border flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-muted-foreground line-clamp-2 text-sm">{p.body}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {p.User.username} · {p.City.name}
                </p>
              </div>
              <form action={removePostFromReview}>
                <input type="hidden" name="postId" value={p.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Remove from app
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
