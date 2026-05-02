# Tech handoff — Toxic (continue build)

This document orients engineers picking up the codebase. The canonical app and Git root live in this directory (`toxic/` relative to the parent workspace folder).

---

## Repository layout

| Location | Role |
|----------|------|
| **This repo** (`./`) | Next.js app, Prisma schema, env, source |
| **Parent folder** (`../`) | Optional `package.json` (`toxic-root`) that proxies npm scripts into this folder via `--prefix toxic`. Use if your IDE workspace root is one level up so `npm run dev` does not resolve the wrong `package.json`. |

Always run installs and Prisma commands against **this** directory unless using the parent proxy intentionally.

---

## Stack

- **Next.js** 16.2.x (App Router, Turbopack in dev)
- **React** 19.2.x
- **TypeScript** 5.x
- **Prisma** 6.19.x + **PostgreSQL** (Supabase-hosted in production-like setups)
- **Supabase** — `@supabase/supabase-js`, `@supabase/ssr` for cookie-based sessions
- **UI** — Tailwind CSS v4, `@base-ui/react`, shadcn-style patterns (`components/ui`, `components.json`)

See `AGENTS.md` for Next.js 16 guidance (breaking changes vs older Next docs).

---

## Environment variables

Validated at startup in `lib/env.ts` with Zod:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Postgres URL (e.g. Supabase pooler + `pgbouncer=true`) |
| `DIRECT_URL` | Optional but recommended for Prisma migrations / non-pooled access |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; used for admin/service operations |

Copy `.env.example` → `.env.local` and fill real values. Never commit `.env*`.

---

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate:dev   # after schema changes
npm run prisma:studio
```

**Database:** `prisma/schema.prisma` currently defines a **`User`** model only. There is **no `prisma/migrations/` directory** in-repo yet — expect to introduce the initial migration when you solidify the schema against the shared database.

---

## Architecture (high level)

1. **`middleware.ts`** — Thin wrapper; session logic lives in `lib/auth/middleware.ts`.
2. **Supabase SSR** — `createServerClient` refreshes session cookies on each matched request.
3. **Route protection** — `PROTECTED_PATHS`: `/onboarding`, `/home`, `/create`, `/settings`, `/admin`. Unauthenticated users are redirected to `/login?next=…`. Logged-in users hitting `/login` or `/sign-up` are redirected to `/home`.
4. **`lib/db/prisma.ts`** — Singleton `PrismaClient` using `env.DATABASE_URL`.
5. **Supabase helpers** — canonical **`lib/supabase/{server,browser,admin}.ts`** (thin re-exports still live under `lib/auth/supabase-*.ts`); guards in **`lib/auth/require-user.ts`** (legacy `guards.ts` re-exports).

---

## Routes (current state)

Scaffold pages exist under `app/` (e.g. `/`, `/home`, `/login`, `/sign-up`, `/create`, `/trending`, `/settings`, `/admin`, `/post/[id]`, `/profile/[username]`, `/city/[slug]`, `/daily-question`, `/onboarding`). Many are **placeholders** — product behavior still needs to be implemented.

`app/page.tsx` is a minimal landing stub pointing to `/home` and `/login`.

---

## Known warnings / follow-ups

1. **Middleware deprecation:** Dev logs may say the **`middleware`** file convention is deprecated in favor of **`proxy`** — track Next.js 16 docs and plan migration when ready.
2. **Prisma major upgrade:** CLI may advertise Prisma 7.x — optional; follow Prisma’s upgrade guide if you bump.
3. **Supabase ↔ Prisma:** Decide how **Auth users** (Supabase) map to **`User`** rows (webhooks, sign-up handler, or lazy sync) — not implemented end-to-end in this foundation alone.

---

## Suggested next steps for the team

1. Align **auth UX**: implement login/sign-up flows against Supabase and redirect/`next` param behavior.
2. Add **initial Prisma migration** and any models (posts, moderation, etc.) to match product requirements.
3. Wire **protected routes** to real data and role checks (`/admin` especially).
4. Flesh out **`lib/moderation`**, **`lib/validation/*`**, and feature routes incrementally.
5. Keep **`.env.local`** out of version control; use hosted secrets in CI/Vercel as appropriate.

---

## Contacts / ownership

(Add: PM / design / infra / on-call — *fill in*.)

---

*Generated for continuity of build; update this file as the architecture evolves.*
