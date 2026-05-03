import Link from "next/link";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications/actions";
import { listNotificationsForUser } from "@/lib/notifications/queries";
import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const dbUser = await requireCompleteProfile("/notifications");
  const items = await listNotificationsForUser(dbUser.id);

  return (
    <section className="flex flex-col gap-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {items.some((n) => n.readAt == null) ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notifications yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border p-4 ${n.readAt ? "bg-muted/20 opacity-90" : "bg-muted/40"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  {n.body ? <p className="text-muted-foreground mt-1 text-sm">{n.body}</p> : null}
                  <p className="text-muted-foreground mt-2 text-xs">{new Date(n.createdAt).toLocaleString()}</p>
                  {n.linkUrl ? (
                    <Link href={n.linkUrl} className="text-primary mt-2 inline-block text-sm underline-offset-4 hover:underline">
                      Open
                    </Link>
                  ) : null}
                </div>
                {n.readAt == null ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={n.id} />
                    <Button type="submit" variant="ghost" size="xs">
                      Mark read
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
