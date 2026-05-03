# Post interactions — manual smoke & staging verification log

## Record — automated verification session

| Field | Value |
|-------|--------|
| **Date / time** | 2026-05-02 (template refresh; re-run commands locally to refresh **PASS** dates). |
| **Environment** | Local workspace; Next.js build loads **`.env.local`** when present during **`npm run build`**. |
| **`REPORT_POST_REVIEW_THRESHOLD`** | Not set for template runs → code default **3** unless overridden in **`.env.local`**. |
| **Users used** | **None** in this template — no interactive browser login unless an operator fills the manual table. |

### Automated commands (executed when validating)

| Command | Result |
|-----------|--------|
| `npm test` | Run locally — vote deltas, report threshold logic, post-id parsing. |
| `npm run lint` | Run locally |
| `npm run typecheck` | Run locally |
| `npm run prisma:validate` | Run locally |
| `npm run prisma:generate` | Run locally |
| `npm run build` | Run locally |

### Manual checklist (operator)

Requires **`npm run dev`**, migrated DB (including **`Notification`**, **`UserFollow`**, partial unique indexes on **`Report`**), Category + City seed, and completed-profile accounts. Update **Pass / Fail** and **Notes** after each run.

| # | Check | Pass / Fail | Notes |
|---|--------|-------------|-------|
| 1 | Comment flow (valid + invalid) on **ACTIVE** post | **Pending** | |
| 2 | Vote flow (Cap/Facts toggle + switch) | **Pending** | |
| 3 | Reaction flow (toggle + counts) | **Pending** | |
| 4 | Report flow; **duplicate OPEN** same reporter + post → friendly error (DB partial unique + **`P2002`**) | **Pending** | |
| 5 | Threshold → **`UNDER_REVIEW`**; **home/trending** omit post (**`ACTIVE`** feeds); **direct `/post/[id]`** still loads with **moderation banner** | **Pending** | Use **`REPORT_POST_REVIEW_THRESHOLD=2`** + 2 distinct reporters |
| 6 | **`UNDER_REVIEW`** detail: no new votes/reactions/comments/report UI; **read-only** counts | **Pending** | |
| 7 | Author **`POST_UNDER_REVIEW`** notification after escalation; **`/notifications`** + nav unread badge | **Pending** | |
| 8 | Follow another user → recipient **`NEW_FOLLOWER`** notification; unfollow idempotent | **Pending** | Profile **Follow** button |
| 9 | Logged-out “Sign in to interact” where applicable | **Pending** | |
| 10 | **`REMOVED`** or invalid post id → **404** / safe behavior | **Pending** | |

### Bugs found

- *(operator)*

### Bugs fixed

- *(operator)*

### Bugs deferred

- *(operator)*

### Final verdict

| Scope | Verdict |
|-------|---------|
| **Automated test + build pipeline** | **GO** only after local commands above **PASS**. |
| **Manual / staging smoke** | **NO-GO** until operator completes checklist (honest pending state). |

---

## How to complete staging smoke

1. **`cp .env.example .env.local`** if needed; set **`DATABASE_URL`**, auth keys; optionally **`REPORT_POST_REVIEW_THRESHOLD=2`** for faster escalation tests.
2. Apply migrations: **`npx prisma migrate deploy`** (or **`migrate dev`**) so **`Notification`**, **`UserFollow`**, and partial unique **`Report`** indexes exist.
3. **`npm run prisma:seed`** (Category + City).
4. At least **two** completed-profile users (second via **`/sign-up`** + **`/onboarding`**, or your seed process).
5. **`npm run dev`** → run the manual checklist; align expected behaviors with **`docs/POST_INTERACTIONS.md`**.
6. Update the manual table with **Pass/Fail** and file issues for failures.

---

## Quick reference (what changed vs older smoke docs)

- **Public UNDER_REVIEW**: Post may disappear from **home/trending** (feeds require **`ACTIVE`**) but remains viewable at **`/post/[id]`** via **`getPublicPostById`** with banner and restricted engagement.
- **Duplicate OPEN reports**: Enforced in the database (partial unique); app surfaces a clear duplicate message on conflict.
- **Notifications**: In-app list at **`/notifications`**; shell badge uses unread count.
- **Follows**: **`UserFollow`** + profile follow; follow triggers **`NEW_FOLLOWER`** for the followee.
