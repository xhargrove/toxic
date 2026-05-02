# Verification checklist

Run locally with **`.env.local`** configured.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Prisma when schema changes:

```bash
npx prisma validate
npx prisma generate
```

## Manual smoke tests

1. **Marketing**: `/` loads without app chrome; `/login`, `/sign-up` render forms.
2. **Auth**: Sign up → session or email confirmation message; sign in → redirected with **`?next=`** respected where applicable.
3. **Shell**: Logged-in users see avatar/initials + Sign out; logged-out see Login/Sign up on desktop; mobile menu lists nav links.
4. **Protected**: Hit `/home` logged out → `/login?next=/home`.
5. **Create**: `/create` requires login; submit creates row (needs **Category** + **City** slug in DB).
6. **Feeds**: `/home`, `/trending`, `/post/[id]` show DB-backed lists / detail / 404.
7. **Admin**: Non-admin redirected from `/admin`; admin sees queue (may be empty).
