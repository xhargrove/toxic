# Database seed (Category + City)

## What it creates

| Record | Slug | Notes |
|--------|------|--------|
| **Category** | `general` | Active; **`/create` prefers this slug** when it exists (see `getDefaultCategoryId`). |
| **City** | `demo-city` | Active; use this value in the **City slug** field on `/create`. |

Implementation: **`prisma/seed.ts`** (idempotent **`upsert`** on `slug`).

## How to run

From the app root (folder with `package.json`), with **`DATABASE_URL`** available (e.g. `.env.local`):

```bash
npm run prisma:seed
```

Equivalent:

```bash
node scripts/prisma-run.mjs db seed
```

`scripts/prisma-run.mjs` loads **`.env.local`** when present (same as other Prisma npm scripts).

Direct Prisma:

```bash
npx prisma db seed
```

(requires `DATABASE_URL` in the environment or a `.env` file Prisma reads.)

## Verify rows exist

```bash
npm run verify:seed
```

Checks that category **`general`** and city **`demo-city`** exist and are active.

## After seeding: `/create`

1. Sign in.
2. Open **`/create`**.
3. Use city slug **`demo-city`** (matches seeded city).
4. Title ≥ 5 chars, body ≥ 20 chars.

See **`docs/VERIFICATION.md`** for a fuller checklist.
