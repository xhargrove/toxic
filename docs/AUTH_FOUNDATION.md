# Auth foundation

## Canonical modules (single implementation each)

| Module | Use |
|--------|-----|
| `lib/supabase/server.ts` | `createSupabaseServerClient()` — Server Components, Server Actions, Route Handlers (`cookies()`). |
| `lib/supabase/browser.ts` | `createSupabaseBrowserClient()` — **only** `NEXT_PUBLIC_*` env vars (never imports `lib/env.ts` on the client bundle). |
| `lib/supabase/admin.ts` | `supabaseAdmin` — **`import "server-only"`**; service role never shipped to the browser. |
| `lib/db/prisma.ts` | Single Prisma singleton. |

Thin re-exports remain under `lib/auth/supabase-*.ts` for backwards compatibility but **must not duplicate logic**.

## Email/password flows

1. **Login / sign-up** use Server Actions **`signInAction`** / **`signUpAction`** with **`createSupabaseServerClient()`** so Supabase session cookies are set on the server response (avoids a race where **browser** auth + **`finalizeAuthSession`** ran before cookies reached the server).
2. **`finalizeAuthSession`** remains available for flows where the session already exists server-side (e.g. future OAuth callback handling).
3. **Sign-out**: **NavigationShell** uses **browser** `signOut({ scope: 'global' })** then `router.replace('/')` + `router.refresh()`.

## Guards

- **`requireUser(returnPath)`** (`lib/auth/require-user.ts`) — redirects to `/login?next=`.
- **`requireDbUser(returnPath)`** — requires a linked Prisma `User` row (`supabaseUserId`).
- **`requireCompleteProfile(returnPath)`** (`lib/auth/onboarding.ts`) — requires **`User.onboardingCompletedAt`**; redirects to **`/onboarding`** if missing (see **`docs/ONBOARDING.md`**).
- **`requireAdmin(returnPath)`** — Prisma `User.role` is **`ADMIN`** or **`MODERATOR`**.

## Redirect safety

`lib/auth/redirect-path.ts` **`sanitizeNextPath`** sanitizes `next` for open redirects.

## Prisma sync

Supabase **`auth.users.id`** maps to **`User.supabaseUserId`** (DB column `authUserId`). App identity for feeds/profile uses **Prisma**, not metadata alone — see `lib/auth/sync-user.ts`.

## Related

- `docs/IMPLEMENTATION_NOTE.md`
- Legacy narrative: `docs/auth-strategy.md` (partially superseded by this file).
