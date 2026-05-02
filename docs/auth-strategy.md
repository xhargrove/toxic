# Authentication strategy (Phase 1)

This document describes how Toxic integrates **Supabase Auth** with **Next.js App Router** and the **Prisma** `User` model.

## Components

| Piece | Role |
|-------|------|
| `@supabase/ssr` | Cookie-backed sessions for server components, middleware, and server actions |
| `lib/auth/supabase-server.ts` | `createSupabaseServerClient()` — reads/writes auth cookies via `next/headers` |
| `lib/auth/supabase-browser.ts` | `createSupabaseBrowserClient()` — client-only helpers when needed later |
| `lib/auth/supabase-admin.ts` | Service-role client for elevated server tasks only (not used in Phase 1 UX) |
| `middleware.ts` | Calls `updateSession` to refresh sessions; enforces protected routes and auth-page redirects |
| `app/auth/actions.ts` | Server Actions: `signInAction`, `signUpAction`, `signOutAction` |
| `lib/auth/sync-user.ts` | Upserts Prisma `User` from `supabase.auth.getUser()` payload |
| `lib/auth/redirect-path.ts` | `sanitizeNextPath` — safe internal redirects after login |

## Session lifecycle

1. **Sign-in / sign-up (session returned)**  
   Server Action authenticates with Supabase, then **`syncUserFromSupabase`** runs so Postgres has a matching row.

2. **Sign-up (email confirmation required)**  
   If Supabase returns **no session** until the user confirms email, sync is skipped. After the user confirms and **signs in**, sync runs on first successful `signInAction`.

3. **Navigation**  
   Root layout calls **`getShellUser()`**: loads Supabase user from cookies, then prefers Prisma profile (`email`, `username`) by **`authUserId`**.

4. **Sign-out**  
   **`signOutAction`** calls `supabase.auth.signOut({ scope: "global" })` and redirects to `/`.

## Prisma user mapping

The Prisma schema in this repo was **introspected** from the shared Supabase Postgres database (full MVP: `Post`, `City`, `User`, etc.). The **`User`** model includes app fields such as **`displayName`**, **`role`**, and **`homeCityId`** required by that schema.

- **`User.authUserId`** stores Supabase **`auth.users.id`** when linked; it is **nullable** so legacy rows created before auth can still exist until someone signs in with the matching email.
- **`syncUserFromSupabase`** resolution order:
  1. Row with **`authUserId`** = session user id → update email (and username/displayName when metadata provides **`username`**).
  2. Else row with **`email`** → set **`authUserId`** and optionally refresh **`username`** / **`displayName`** from metadata.
  3. Else **create** a user with **`username`** / **`displayName`** derived from sign-up metadata or a deterministic handle from email (with uniqueness retries).

Sign-up metadata **`username`** is copied into **`user_metadata`** via Supabase **`signUp({ options: { data: { username }}})`**.

### Migration note

Remote migration history did not match local migration files (drift). Adding **`authUserId`** was applied with **`prisma db push`** against `.env.local`. For a clean migration history going forward, consider **`prisma migrate diff`** / **`prisma migrate resolve`** or baselining from production — coordinate with whoever owns the Supabase project.

## Redirect safety (`next` query)

- Middleware sends unauthenticated users to **`/login?next=<pathname>`** for protected routes.
- **`sanitizeNextPath`** only allows same-origin relative paths (must start with `/`, rejects `//`, `://`, backslashes, oversized strings).
- Default fallback when `next` is missing or invalid: **`/home`**.
- Logged-in users hitting **`/login`** or **`/sign-up`** are redirected to **`sanitizeNextPath(next)`** so bookmarked login links with `?next=` still work.

## Server-only guards

**`requireUser(returnPath)`** in `lib/auth/guards.ts` redirects to **`/login?next=<returnPath>`** when there is no session. Pass the route you are protecting (e.g. `"/settings"`) so deep-linking matches middleware behavior.

## Security notes

- Never import **`supabase-admin`** or **`SUPABASE_SERVICE_ROLE_KEY`** into client components.
- Service role is for trusted server-only flows (admin, moderation); keep Phase 1 mutations on the anon/server session + Prisma.

## Future extensions

- OAuth providers via Supabase dashboard + callback routes.
- DB trigger or Auth hook to sync users if sign-up paths multiply.
- Role-based access for `/admin` using JWT claims or a `role` column.
