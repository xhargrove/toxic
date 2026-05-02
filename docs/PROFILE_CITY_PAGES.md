# Profile & city pages

## Profile `/profile/[username]`

- **`lib/users/queries.ts`** — **`getUserProfileByUsername`** → **`notFound()`** if absent.
- **`listPostsForAuthor`** for public posts.

## City `/city/[slug]`

- **`lib/cities/queries.ts`** — **`getCityBySlug`** → **`notFound()`** if missing or inactive.
- **`listPostsForCity`**.

## Daily question `/daily-question`

**Deferred** — UI explains that **`DailyQuestion`** exists in Prisma but global vs city scope needs a product decision before backend work.
