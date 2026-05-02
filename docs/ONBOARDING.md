# Onboarding

After Supabase Auth signs someone in, the app uses **Prisma `User`** as the source of truth for profile identity (not Supabase metadata alone). New accounts must finish **in-app onboarding** before using product routes grouped under **`(main)`**.

## Completeness rule

A profile is **complete** when **`User.onboardingCompletedAt`** is set (non-null). Submitting the onboarding form sets this timestamp and saves:

- **username** (required, unique in DB)
- **displayName** (required)
- **avatarUrl** (optional)
- **homeCityId** (optional; city picker only appears when at least one active `City` exists)

`homeCityId` is optional even when cities exist; the rule matches “optional home city when selection is implemented.”

## Redirect behavior

| Visitor | Path | Result |
|--------|------|--------|
| Logged out | `/onboarding` | Middleware → `/login?next=/onboarding` |
| Logged in, incomplete | Any **`(main)`** route (e.g. `/home`, `/create`, `/trending`) | **`app/(app)/(main)/layout.tsx`** → `/onboarding` |
| Logged in, incomplete | `/onboarding` | Onboarding layout + page (no loop: `(main)` layout does not wrap `/onboarding`) |
| Logged in, complete | `/onboarding` | **`app/(app)/onboarding/layout.tsx`** → `/home` |
| Logged in, complete | **`(main)`** routes | Allowed |

Deep-linking after login uses **`requireDbUser(returnPath)`** / **`requireCompleteProfile(returnPath)`** with **`returnPath`** from the **`x-pathname`** header set in **`lib/auth/middleware.ts`** so `?next=` matches the URL being accessed.

## Implementation map

| Piece | Role |
|-------|------|
| `lib/auth/onboarding.ts` | `isOnboardingComplete`, `requireCompleteProfile` |
| `lib/auth/require-db-user.ts` | Session + Prisma user row (sync) |
| `lib/users/update-profile.ts` | `completeOnboardingAction` (Zod, Prisma update, `P2002` username handling) |
| `lib/validation/user.ts` | `onboardingFormSchema` |
| `app/(app)/(main)/layout.tsx` | Gate product routes |
| `app/(app)/onboarding/layout.tsx` | Block completed users from seeing the form |
| `lib/posts/actions.ts` | `requireCompleteProfile('/create')` on `createPostAction` (defense in depth) |

## Database

- **`User.onboardingCompletedAt`** — migration **`20260205120000_onboarding_completed_at`**. Existing rows at migration time are backfilled to **`createdAt`** so current users are not forced through onboarding; **new** users created after deploy get **`null`** until they submit the form (`sync-user.ts`).

## Commands

Apply schema changes:

```bash
npm run prisma:migrate:dev   # or deploy migration in your environment
npm run prisma:generate
```

Seed cities if you want the optional picker: **`npm run prisma:seed`** (see **`docs/SEED.md`**).
