# Admin & moderation

## Authority model

- **Source of truth**: **`User.role`** (`ADMIN` | `MODERATOR` | `USER`).
- **`requireAdmin(returnPath)`** (`lib/auth/require-admin.ts`) loads Prisma user by **`supabaseUserId`** and redirects non-privileged users to **`/home`**.

## Routes

- **`/admin`** — **`requireAdmin`** then **`listModerationQueue`** (`status: UNDER_REVIEW`).
- **Remove** — **`removePostFromReview`** Server Action (form **`postId`**) sets **`ContentStatus.REMOVED`**.

## Service role

- **`lib/supabase/admin.ts`** — server-only; **never** import from Client Components.

## Middleware

- Anonymous users cannot reach **`/admin`** (middleware). Role checks are **not** in middleware (no DB); **`requireAdmin`** enforces role on the server.

## Audit trail

Not implemented — **`ModerationAction`** table exists for future structured logging.
