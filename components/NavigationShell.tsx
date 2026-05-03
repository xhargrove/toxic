"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Flame, Home, PlusSquare, Settings, Shield } from "lucide-react";

import type { ShellUser } from "@/lib/auth/session";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield },
] as const;

export function NavigationShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut({ scope: "global" });
    router.replace("/");
    router.refresh();
  }

  const label = user?.displayName?.trim() || user?.username || user?.email || "";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4">
          <Link className="font-semibold tracking-tight shrink-0" href="/">
            Toxic
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-4 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const unread =
                item.href === "/notifications" && user && (user.unreadNotificationCount ?? 0) > 0
                  ? user.unreadNotificationCount
                  : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    pathname === item.href && "text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {unread != null ? (
                    <span className="bg-primary text-primary-foreground ml-0.5 min-w-[1.25rem] rounded-full px-1 text-center text-[10px] font-medium tabular-nums leading-tight">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm md:gap-3">
            <MobileNav unreadNotificationCount={user?.unreadNotificationCount} />
            {user ? (
              <>
                <span className="text-muted-foreground hidden max-w-[12rem] truncate text-xs lg:inline">
                  {label}
                </span>
                <Link
                  href="/settings"
                  className="hover:bg-muted relative hidden size-8 shrink-0 overflow-hidden rounded-full border md:inline-flex"
                  aria-label="Account settings"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote URLs; configure `next/image` domains if optimizing avatars
                    <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs font-medium">
                      {(user.displayName?.trim() || user.username || user.email).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </Link>
                <Button type="button" variant="outline" size="sm" onClick={() => void handleSignOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link className="text-muted-foreground hover:text-foreground hidden sm:inline" href="/login">
                  Login
                </Link>
                <Link className="text-muted-foreground hover:text-foreground hidden sm:inline" href="/sign-up">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4">{children}</main>
    </div>
  );
}
