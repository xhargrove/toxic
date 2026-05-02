# Data model

## Source of truth

The **`prisma/schema.prisma`** file reflects the **live Supabase Postgres** schema (introspected MVP). It includes **`User`**, **`Post`**, **`City`**, **`Category`**, moderation enums/tables, etc.

## Auth linkage

- **`User.supabaseUserId`** maps to DB column **`authUserId`** (`@map("authUserId")`).
- Unique **`username`**, unique **`email`**, **`UserRole`** enum for admin/mod.

## Posts & feeds

- **`Post`** uses **`cityId`**, **`categoryId`**, **`authorId`**, **`status`** (`ContentStatus`), engagement counters, **`visibility`**.
- **`createPostAction`** defaults **`postType: OPINION`**, **`visibility: PUBLIC`**, **`status: ACTIVE`**, and picks the **first active `Category`** ordered by `slug` (requires at least one category row in DB).

## URLs vs FKs

- UI/API validation uses **`citySlug`** (`createPostSchema`); server resolves **`City`** by **`slug`** → **`cityId`**.

## Migrations

Remote migration history previously drifted from this repo. **`prisma db push`** was used for additive columns. For production, baseline **`prisma migrate`** with your Supabase branch — coordinate with infra.

## Env

- **`DATABASE_URL`** — pooled (often `?pgbouncer=true`).
- **`DIRECT_URL`** — migrations / long sessions — point at Supabase docs’ **direct** connection when using `migrate`.

See **`.env.example`**.
