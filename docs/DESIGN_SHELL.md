# Design shell

## Route groups

- **`app/(marketing)/`** — Landing (`/`), **`/login`**, **`/sign-up`**. No main chrome; focused auth/marketing.
- **`app/(app)/`** — Authenticated app surfaces with **`NavigationShell`**.

## Components

- **`components/NavigationShell.tsx`** — Desktop nav, optional avatar chip (or initials), account link to `/settings`, **Sign out** (browser Supabase client).
- **`components/mobile-nav.tsx`** — Slide-over drawer for **`NAV_ITEMS`** on small screens (`md:hidden` trigger).

## Layouts

- **`app/layout.tsx`** — HTML shell, fonts, global CSS only.
- **`app/(marketing)/layout.tsx`** — Pass-through (marketing pages unwrapped).
- **`app/(app)/layout.tsx`** — Loads **`getShellUser()`** and wraps children with **`NavigationShell`**.

## Forms

Create post uses existing **`Button`** + native inputs styled with shared Tailwind classes (`create-post-form.tsx`). Further shadcn primitives can be added incrementally.
