# Post interactions

Server-driven comments, Cap/Facts votes, emoji-class reactions, and reports. **No client-side counter authority**: counts come from Prisma `Post` scalars and actions refresh via **`revalidatePath`**.

## Server actions (single implementation each)

| Action | Module | Guard |
|--------|----------|--------|
| **`createCommentAction`** | `lib/comments/actions.ts` | **`requireCompleteProfile`** |
| **`setVoteAction`** | `lib/votes/actions.ts` | **`requireCompleteProfile`** |
| **`toggleReactionAction`** | `lib/reactions/actions.ts` | **`requireCompleteProfile`** |
| **`reportPostAction`** | `lib/reports/actions.ts` | **`requireCompleteProfile`** |

Unauthenticated or incomplete users are redirected (`requireDbUser` → `/login`, onboarding → `/onboarding`) before mutations run.

## Models & constraints

| Model | Role | Duplicate prevention |
|-------|------|----------------------|
| **`Comment`** | Thread body; `ACTIVE` only for reads | N/A (many per post) |
| **`Vote`** | One row per user per post | **`@@unique([postId, userId])`** |
| **`Reaction`** | One row per `(postId, userId, reactionType)` | **`@@unique([postId, userId, reactionType])`** |
| **`Report`** | Reporter + optional post | **DB**: partial unique indexes so only **OPEN** rows enforce uniqueness on **`(reporterId, postId)`** and **`(reporterId, commentId)`** (race-safe with **`P2002`** handling in **`reportPostAction`**). |

## Post eligibility (`ACTIVE` vs moderation)

- **Comments / votes / reactions**: **`getActivePostForMutations`** (`lib/interactions/post-for-actions.ts`) — only **`Post.status === ACTIVE`**. **`UNDER_REVIEW`** and **`REMOVED`** are rejected (no new engagement).
- **Reports**: **`getPostTargetForReport`** — **`ACTIVE`** or **`UNDER_REVIEW`** so additional reporters can file while a post is already in review; **`REMOVED`** cannot be reported.

## Post ID validation

- **`parsePostIdParam`** / **`postIdSchema`** (`lib/validation/interactions.ts`) — length/charset guard before queries (rejects obvious injection/path fragments).

## Counter rules (transaction-safe)

- **Comments**: `$transaction`: create `Comment` + **`commentCount` += 1**.
- **Votes**: **`voteCounterAdjustments`** (`lib/votes/vote-counter-deltas.ts`) computes **`capCount` / `factsCount`** deltas for create / toggle-off / switch; **`setVoteAction`** applies one **`Post` update** with **`increment`** deltas inside `$transaction` with vote row create/delete/update.
- **Reactions**: `$transaction`: create/delete `Reaction` + **`reactionCount` ± 1**. **`P2002`** (race on unique) aborts the whole transaction — **no overcount**.
- **Reports**: creating a **`Report`** does not increment content counters. **`OPEN`** reports are counted after insert for escalation only.

## Report threshold

- Env **`REPORT_POST_REVIEW_THRESHOLD`** (default **3**). **`shouldEscalatePostToReview`** (`lib/reports/threshold-logic.ts`): only **`ACTIVE`** posts move to **`UNDER_REVIEW`** when **`openReportCount >= threshold`**.
- **Duplicate OPEN report** from the same user hits the partial unique index → **`P2002`** → friendly error; **open count unchanged**, threshold cannot be crossed by duplicates.

## Viewer state

- **`getViewerInteractionsForPosts`** (`lib/posts/viewer-state.ts`) loads **`Vote`** + **`Reaction`** rows for the current user and post IDs. Invalid IDs are filtered out before querying. Logged-out callers skip DB lookups (pages pass an empty map).

## UI wiring

| Surface | Behavior |
|---------|-----------|
| **`components/posts/post-card.tsx`** | Feed: **`PostCardActions`** (Cap/Facts + reactions + DB counts), **Report** → **`/post/[id]#report`**, **Sign in to interact** when no viewer row |
| **`components/posts/post-card-actions.tsx`** | Forms POST to server actions only; highlights use viewer map only |
| **`app/(app)/(main)/post/[id]/page.tsx`** | Detail: actions + **`CommentList`** + **`CommentForm`** + **`PostReportForm`** (`id="report"` anchor) |
| Errors | **`useActionState`** surfaces server errors; no fabricated totals |

**Public post detail**: **`getPublicPostById`** (`lib/posts/queries.ts`) returns **`PUBLIC`** posts with **`ACTIVE`** or **`UNDER_REVIEW`** (not **`REMOVED`**). **`UNDER_REVIEW`** shows a moderation banner; votes, reactions, new comments, and report UI are restricted (read-only counts). **`getPostById`** remains stricter where used internally (e.g. **`ACTIVE` + `PUBLIC`** only).

## Tests (unit)

- **`lib/votes/vote-counter-deltas.test.ts`** — vote delta matrix.
- **`lib/reports/threshold-logic.test.ts`** — escalation rules.
- **`lib/validation/interactions-postid.test.ts`** — **`postId`** parsing.

Run: **`npm test`** (`node --import tsx --test …`). Integration/e2e tests against a live DB are **not** in-repo.

**Manual smoke log:** **`docs/POST_INTERACTIONS_SMOKE_RESULTS.md`** — operator checklist + recorded automated runs (browser smoke is filled in locally).

## Known gaps / deferred

- No optimistic UI; counts refresh after server revalidation.

## Related: notifications & follows

- **`Notification`** model + **`/notifications`** UI; author receives **`POST_UNDER_REVIEW`** when a post escalates; **`NEW_FOLLOWER`** when someone follows.
- **`UserFollow`** + profile **Follow** button; **`requireCompleteProfile`** on follow actions.
