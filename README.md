# Toxic

Next.js 16 app with Supabase Auth, Supabase Postgres (via Prisma), and route-group marketing vs app chrome.

## Prerequisites

- Node 20+
- Supabase project (Auth + Postgres connection strings)

## Local setup

```bash
cd toxic   # app root (this folder if your repo nests `toxic/toxic`)
npm install
cp .env.example .env.local
# Fill DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (optional: DIRECT_URL for app-only use — see docs/DATA_MODEL.md)
npm run prisma:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Prisma CLI and `.env.local`

**Do not run** `npx prisma …` by itself if your database URL only lives in **`.env.local`**. The Prisma CLI only auto-loads **`.env`**, not `.env.local`, so you will see **`P1012` / `Environment variable not found: DATABASE_URL`**.

**Use the npm scripts** (they run `scripts/prisma-run.mjs`, which applies `.env.local` when it exists):

```bash
npm run prisma:validate
npm run prisma:generate
```

Or, if you must use the Prisma binary directly:

```bash
node --env-file=.env.local ./node_modules/prisma/build/index.js validate
```

Work from the **app root** (the folder that contains `package.json` and `prisma/`), e.g. `toxic/toxic` if the repo is nested.

## Auth

- Email/password uses Server Actions **`signInAction`** / **`signUpAction`** (`app/auth/actions.ts`) plus **`lib/auth/sync-user.ts`**. **`lib/supabase/browser.ts`** is for client-only flows (e.g. sign-out).
- Details: **`docs/AUTH_FOUNDATION.md`**.

## Database

- Schema is **`prisma/schema.prisma`** (introspected from the shared DB).
- Apply migrations (includes **`User.onboardingCompletedAt`** for onboarding) via **`npm run prisma:migrate:dev`** or your deployment pipeline; see **`docs/ONBOARDING.md`**.
- **`npm run prisma:migrate:dev`** should be coordinated when migration history matches your branch; until then use **`npm run prisma:db:push`** only with team agreement.
- **Seed** default Category + City for local/dev: **`npm run prisma:seed`** (details: **`docs/SEED.md`**). Then on **`/create`** use city slug **`demo-city`**.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Stub (see **`docs/VERIFICATION.md`**) |
| `npm run prisma:validate` | Validate schema (loads `.env.local` via `scripts/prisma-run.mjs`) |
| `npm run prisma:generate` | Prisma Client |
| `npm run prisma:migrate:dev` | Migrations (when baselined) |
| `npm run prisma:db:push` | `db push` (loads `.env.local` when present) |
| `npm run prisma:seed` | Seed default Category (`general`) + City (`demo-city`) |
| `npm run verify:seed` | Confirm seed data exists for `/create` |

## Documentation index

- **`docs/IMPLEMENTATION_NOTE.md`** — pre-build inspection summary  
- **`docs/AUTH_FOUNDATION.md`** — auth modules & sync  
- **`docs/ONBOARDING.md`** — profile completion, `/onboarding`, redirect rules  
- **`docs/DESIGN_SHELL.md`** — layouts & navigation  
- **`docs/DATA_MODEL.md`** — Prisma / env strategy  
- **`docs/SEED.md`** — default Category/City seed  
- **`docs/FEED_CREATE_FLOW.md`** — posts & feeds  
- **`docs/POST_INTERACTIONS.md`** — comments, votes, reactions, reports  
- **`docs/POST_INTERACTIONS_SMOKE_RESULTS.md`** — smoke checklist log (manual + automated)  
- **`docs/PROFILE_CITY_PAGES.md`** — profile & city  
- **`docs/ADMIN_MODERATION.md`** — roles & moderation  
- **`docs/CROSS_CUTTING.md`** — middleware/proxy, CI  
- **`docs/VERIFICATION.md`** — manual + command checks  

## Deploy

Configure the same environment variables on your host (Vercel, etc.). Never expose **`SUPABASE_SERVICE_ROLE_KEY`** or **`DATABASE_URL`** to the client. Use **`NEXT_PUBLIC_*`** only for public Supabase URL + anon key.
