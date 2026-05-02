# Implementation note (pre-build inspection)

## 1. Next.js version

**16.2.4** (App Router, Turbopack in dev). Deprecation: root `middleware.ts` — platform recommends migrating to **`proxy.ts`** when adopting Next 16 conventions (see `docs/CROSS_CUTTING.md`).

## 2. Auth setup

- **Middleware** (`middleware.ts` → `lib/auth/middleware.ts`): Supabase SSR cookie refresh; protected paths for anonymous users → `/login?next=`; authenticated users on `/login` | `/sign-up` → sanitized `next` or `/home`.
- **Server Actions** (`app/auth/actions.ts`): `signInWithPassword`, `signUp`, `signOut` via **`createSupabaseServerClient`** (browser-auth refactor planned to **`lib/supabase/browser.ts`** + finalize sync server action).
- **Guards** (`lib/auth/guards.ts`): `requireUser(returnPath)` → `/login?next=`.
- **Sync** (`lib/auth/sync-user.ts`): Prisma `User` linked by Supabase user id + email fallback.

## 3. Supabase setup

- **`@supabase/ssr`**: `createServerClient` (cookies), `createBrowserClient` (browser).
- **`@supabase/supabase-js`**: service-role admin client (server-only target).
- **Env** (`lib/env.ts`): `DATABASE_URL`, optional `DIRECT_URL`, `NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Prisma setup

- **Postgres** via Supabase; introspected **full MVP schema** (User, Post, City, Category, enums, moderation tables).
- **`User.authUserId`** nullable unique links Auth (rename to **`supabaseUserId`** + `@map("authUserId")` in code plan).
- **Singleton** `lib/db/prisma.ts` — single Prisma client.
- Migration history diverged from remote DB earlier; **`db push`** used for additive changes — coordinate **`migrate`** baseline for production.

## 5. Route structure

Flat `app/*/page.tsx` routes (landing, login, sign-up, home, create, trending, post, profile, city, settings, admin, …). No `(app)` / `(marketing)` groups yet.

## 6. Protected-route behavior

**Middleware-only** for listed paths (`/home`, `/create`, `/settings`, `/admin`, `/onboarding`). **`/admin`** not yet role-checked — **risk**. Pages are scaffolds without **`requireUser()`** on each route (middleware assumed).

## 7. Duplicate / risky systems

| Risk | Mitigation |
|------|------------|
| Supabase helpers split across `lib/auth/supabase-*.ts` | Consolidate into **`lib/supabase/{server,browser,admin}.ts`**; thin re-exports temporarily. |
| Two auth patterns (server actions vs browser) | Standardize on **browser client for sign-in/up** + **one server finalize** for Prisma sync + redirect. |
| `requireUser` vs middleware | Align **`returnPath`** with middleware `next`. |
| `types/index.ts` vs Prisma | Align or remove fictional shapes. |
| Admin route without `requireAdmin` | Add **`lib/auth/require-admin.ts`** + Prisma `UserRole`. |

## 8. Recommended implementation order

1. **Auth foundation** — single Supabase module paths, browser auth, `require-user.ts`, docs.
2. **Design shell** — auth-aware nav, mobile nav, optional route groups.
3. **Data model** — `supabaseUserId` naming, docs; migrations where possible.
4. **Feed / create** — server actions, `createPostSchema`, real queries (Category + City resolution).
5. **Profile / city** — Prisma queries by username/slug.
6. **Admin / moderation** — `requireAdmin`, post status, queue, server-only admin client.

This matches the dependency order in the project build plan.
