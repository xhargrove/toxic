# Post interactions

Comments, votes (Cap / Facts), reactions, and reporting use Prisma **`Comment`**, **`Vote`**, **`Reaction`**, and **`Report`**. All mutations run as Server Actions and call **`requireCompleteProfile(returnPath)`** so incomplete accounts are redirected to **`/onboarding`** (or unauthenticated users to **`/login`** via **`requireDbUser`**).

## Comments

- **`lib/comments/actions.ts`** — **`createCommentAction`** validates body length, creates **`Comment`** (`ACTIVE`, top-level only), increments **`Post.commentCount`**, **`revalidatePath`** for home, trending, post detail, and city feed.
- **`lib/comments/queries.ts`** — **`listActiveCommentsForPost`** returns **`ACTIVE`** root comments with author display fields.
- UI: **`components/comments/comment-list.tsx`**, **`components/comments/comment-form.tsx`** on **`/post/[id]`**.

## Votes (Cap / Facts)

- **`Vote`** has **`@@unique([postId, userId])`** — one vote per user per post.
- **`lib/votes/actions.ts`** — **`setVoteAction`**: first vote increments **`Post.capCount`** or **`factsCount`**; same button again removes the vote (toggle off); switching type adjusts both counters in one transaction.
- Feed and detail use **`components/posts/post-card-actions.tsx`** with **`VoteSubmit`** forms.

## Reactions

- **`Reaction`** has **`@@unique([postId, userId, reactionType])`** — one row per type per user per post.
- **`lib/reactions/actions.ts`** — **`toggleReactionAction`** creates or deletes the row and increments/decrements **`Post.reactionCount`**. **`P2002`** returns a friendly error if a race duplicates a reaction.
- Feed shows three reaction types; post detail shows all **`ReactionType`** values.

## Reporting

- **`lib/reports/actions.ts`** — **`reportPostAction`** creates **`Report`** with **`status: OPEN`**. Duplicate **open** reports from the same reporter on the same post are rejected.
- When **`OPEN`** report count for the post reaches the threshold (default **3**, override with **`REPORT_POST_REVIEW_THRESHOLD`**), the post is set to **`ContentStatus.UNDER_REVIEW`** (only if it was **`ACTIVE`**).
- **`listHomePosts`** / **`listTrendingPosts`** / **`getPostById`** only expose **`ACTIVE` + `PUBLIC`** posts, so reviewed content disappears from public feeds until moderation restores it.

## Viewer state

- **`lib/posts/viewer-state.ts`** — **`getViewerInteractionsForPosts`** batches the current user’s vote and reaction types for feed cards (highlights active controls).

## Validation

- **`lib/validation/interactions.ts`** — Zod schemas shared by actions.

## Smoke testing

See **`docs/VERIFICATION.md`**. Apply **`npm run prisma:migrate:dev`** (or equivalent) so schema matches **`prisma/schema.prisma`**.
