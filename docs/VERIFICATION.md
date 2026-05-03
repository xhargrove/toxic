# Verification checklist

Run locally with **`.env.local`** configured.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

**Unit tests** (`npm test`): vote counter deltas, report escalation threshold, post-id parsing — **no DB** (see **`docs/POST_INTERACTIONS.md`**). Same commands using **`npx prisma validate`** / **`npx prisma generate`** work when **`DATABASE_URL`** is set (scripts prefer **`npm run prisma:*`** so **`.env.local`** loads).

Prisma when schema changes (loads **`.env.local`** automatically via `scripts/prisma-run.mjs`; plain `npx prisma` only reads **`.env`**):

```bash
npm run prisma:validate
npm run prisma:generate
```

After pulling schema changes, apply migrations (adds **`User.onboardingCompletedAt`**, etc.):

```bash
npm run prisma:migrate:dev
```

## Database seed (before `/create`)

```bash
npm run prisma:seed
npm run verify:seed
```

Use city slug **`demo-city`** on **`/create`** after seeding.

## Manual smoke tests

1. **Marketing**: `/` loads without app chrome; `/login`, `/sign-up` render forms.
2. **Auth**: Sign up → session or email confirmation message; sign in → redirected with **`?next=`** respected where applicable.
3. **Onboarding**: New user after migration lands on **`/onboarding`** when visiting **`(main)`** routes; anonymous **`/onboarding`** → **`/login?next=/onboarding`**; completed profile goes to **`/home`** from onboarding; duplicate username shows field error; nav shows **display name** + avatar after submit (see **`docs/ONBOARDING.md`**).
4. **Shell**: Logged-in users see avatar/initials + Sign out; logged-out see Login/Sign up on desktop; mobile menu lists nav links.
5. **Protected**: Hit `/home` logged out → `/login?next=/home`.
6. **Create**: `/create` requires login and completed onboarding; submit creates row (needs **Category** + **City** slug in DB).
7. **Feeds**: `/home`, `/trending`, `/post/[id]` show DB-backed lists / detail / 404.
8. **Admin**: Non-admin redirected from `/admin`; admin sees queue (may be empty).
