# Feed / create flow

## Server Actions

- **`lib/posts/actions.ts`** — **`createPostAction`** uses **`requireDbUser('/create')`**, **`createPostSchema`**, creates **`Post`** with **`randomUUID()`** id and **`updatedAt: new Date()`**.

## Queries

- **`lib/posts/queries.ts`** — **`listHomePosts`**, **`listTrendingPosts`** (reaction count then recency), **`getPostById`**, **`listPostsForCity`**, **`listPostsForAuthor`**, **`listModerationQueue`**.

## Routes

| Route | Behavior |
|-------|----------|
| `/home` | Newest public active posts |
| `/trending` | **`reactionCount` DESC**, then **`createdAt` DESC** |
| `/create` | **`CreatePostForm`** → **`createPostAction`** → redirect `/home` |
| `/post/[id]` | **`notFound()`** if missing / not public-active |

## Empty states

Each list renders a short message when zero rows.

## Pagination

Simple **`take`/`limit`** (20–30). Cursor pagination can be layered later.
