"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, PlusSquare, Settings, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield },
] as const;

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link className="font-semibold tracking-tight" href="/">
            Toxic
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
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
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/login">
              Login
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/sign-up">
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4">{children}</main>
    </div>
  );
}
