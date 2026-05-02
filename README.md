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
# Fill DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth

- Browser auth uses **`lib/supabase/browser.ts`** (`signInWithPassword` / `signUp`).
- Server sync uses **`finalizeAuthSession`** in `app/auth/actions.ts` and **`lib/auth/sync-user.ts`**.
- Details: **`docs/AUTH_FOUNDATION.md`**.

## Database

- Schema is **`prisma/schema.prisma`** (introspected from the shared DB).
- **`prisma migrate dev`** should be coordinated when migration history matches your branch; until then use **`npx prisma db push`** only with team agreement.
- Creating posts requires at least one **`Category`** row and a valid **`City.slug`**.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Stub (see **`docs/VERIFICATION.md`**) |
| `npm run prisma:generate` | Prisma Client |
| `npm run prisma:migrate:dev` | Migrations (when baselined) |

## Documentation index

- **`docs/IMPLEMENTATION_NOTE.md`** — pre-build inspection summary  
- **`docs/AUTH_FOUNDATION.md`** — auth modules & sync  
- **`docs/DESIGN_SHELL.md`** — layouts & navigation  
- **`docs/DATA_MODEL.md`** — Prisma / env strategy  
- **`docs/FEED_CREATE_FLOW.md`** — posts & feeds  
- **`docs/PROFILE_CITY_PAGES.md`** — profile & city  
- **`docs/ADMIN_MODERATION.md`** — roles & moderation  
- **`docs/CROSS_CUTTING.md`** — middleware/proxy, CI  
- **`docs/VERIFICATION.md`** — manual + command checks  

## Deploy

Configure the same environment variables on your host (Vercel, etc.). Never expose **`SUPABASE_SERVICE_ROLE_KEY`** or **`DATABASE_URL`** to the client. Use **`NEXT_PUBLIC_*`** only for public Supabase URL + anon key.
