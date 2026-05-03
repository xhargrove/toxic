# Build plan execution — final report

## 1. Overall status

**GO** — `npm run lint`, `npm run typecheck`, `npm run build`, and `npx prisma validate` succeed against the current repo after clearing stale `.next/` (generated route validators must match moved route groups).

## 2. Phases completed

| Phase | Status |
|-------|--------|
| Inspect + implementation note | Done (`docs/IMPLEMENTATION_NOTE.md`) |
| Phase 1 — Auth foundation | Done — canonical `lib/supabase/*`, browser auth + `finalizeAuthSession`, `require-user`, `require-db-user`, `AUTH_FOUNDATION.md` |
| Phase 2 — Design shell | Done — `(marketing)` vs `(app)` groups, `NavigationShell`, `mobile-nav`, `DESIGN_SHELL.md` |
| Phase 3 — Data model | Done in repo — introspected schema + `supabaseUserId` mapping; **`prisma migrate dev` not run** (history drift); `DATA_MODEL.md` |
| Phase 4 — Feed / create | Done — real queries + `createPostAction`, pages wired |
| Phase 5 — Profile / city | Done + daily question explicitly deferred |
| Phase 6 — Admin / moderation | Done — `requireAdmin`, queue, `removePostFromReview`, `ADMIN_MODERATION.md` |
| Cross-cutting | Done — CI workflow, README, `CROSS_CUTTING.md`, `VERIFICATION.md` |

## 3. Files created (high level)

- `lib/supabase/server.ts`, `browser.ts`, `admin.ts`
- `lib/auth/require-user.ts`, `require-db-user.ts`, `require-admin.ts`
- `lib/posts/queries.ts`, `lib/posts/actions.ts`
- `lib/users/queries.ts`, `lib/cities/queries.ts`
- `lib/moderation/actions.ts`
- `components/NavigationShell.tsx`, `components/mobile-nav.tsx`
- `app/(marketing)/layout.tsx`, `app/(app)/layout.tsx` (+ moved routes under groups)
- `app/(app)/create/create-post-form.tsx`
- `docs/*.md` (implementation note, auth, shell, data, feed, profile/city, admin, cross-cutting, verification)
- `.github/workflows/ci.yml`
- `BUILD_REPORT.md` (this file)

## 4. Files modified / removed

- `package.json` — `test` script, `server-only` dependency
- `prisma/schema.prisma` — `supabaseUserId` `@map("authUserId")`
- `lib/auth/sync-user.ts`, `session.ts`, `guards.ts`, `middleware` consumers
- `app/auth/actions.ts` — finalize-only server auth choke point
- `app/login/*`, `app/sign-up/*` (under `(marketing)`) — browser clients
- `app/layout.tsx` — shell lifted to `(app)/layout.tsx`
- Removed `components/layout/navigation-shell.tsx` (replaced by `NavigationShell.tsx`)
- `types/index.ts` — Prisma re-exports
- `README.md`, `.env.example` (verify comments if edited)

## 5. Feature matrix

| Question | Answer |
|----------|--------|
| Auth implemented | **Yes** |
| Shell implemented | **Yes** |
| Prisma model implemented | **Yes** (introspected full MVP + documented naming) |
| Feed/create implemented | **Yes** |
| Profile/city implemented | **Yes** |
| Admin/moderation implemented | **Yes** (role + queue + remove) |

## 6. Duplicate systems found / fixed

- **Supabase clients**: Consolidated under **`lib/supabase/{server,browser,admin}`**; legacy **`lib/auth/supabase-*.ts`** are thin re-exports only.
- **Prisma**: Still single **`lib/db/prisma.ts`**.
- **Browser env**: **`lib/supabase/browser.ts`** avoids importing **`lib/env.ts`** on the client (prevents accidental server secret validation in the bundle).

## 7. Commands run / results

```bash
rm -rf .next   # recommended after route-group moves
npx prisma validate   # pass
npx prisma generate   # pass
npm run lint          # pass (NavigationShell img rule suppressed with eslint comment)
npm run typecheck     # pass
npm run build         # pass
```

Stub: `npm test` exits 0 with message (no unit suite yet).

## 8. Failures / blockers

- **`npx prisma migrate dev`** was **not** executed successfully in long-lived drift scenarios — coordinate baselining against Supabase before relying on migration history in CI/CD.
- **CI build** uses placeholder env vars; production deploy needs real secrets.

## 9. Remaining risks

- **`requireDbUser`** redirects to login if Supabase session exists but Prisma row missing (failed sync) — possible redirect loop until sync succeeds.
- **Category / City seed data**: create post fails until **`Category`** rows and matching **`City.slug`** exist.
- **Trending** uses **`reactionCount`** only — product may want a dedicated score field later.
- **Moderation queue** only shows **`UNDER_REVIEW`** posts — workflow to move posts into that state is product-defined.
- **Middleware deprecation** — migrate to **`proxy.ts`** when adopting Next 16 guidance.

## 10. Deferred non-blockers

- Automated unit/integration tests beyond **`docs/VERIFICATION.md`**.
- Daily question backend (`docs/PROFILE_CITY_PAGES.md`).
- Full **`next/image`** avatar domains config.
- Moderation audit rows populated in **`ModerationAction`**.

## 11. Exact next step

**Seed or verify** at least one **`Category`** (active) and one **`City`** (`slug` users will type on `/create`), then run **`npm run dev`** and complete the **`docs/VERIFICATION.md`** smoke checklist.

## 12. Post interactions QA (May 2026)

**GO** — Server actions consolidated behind **`getActivePostForMutations`** / **`getPostTargetForReport`**, **`parsePostIdParam`**, pure **`voteCounterAdjustments`** + **`shouldEscalatePostToReview`**, unit tests via **`npm test`** (`node --import tsx --test`). Feed cards wire **Report** + **Sign in to interact**; detail **`#report`** anchor. See **`docs/POST_INTERACTIONS.md`**.
