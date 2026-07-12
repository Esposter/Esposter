---
title: Feed block filtering
description: Posts and comments from users the viewer has blocked are hidden from feeds.
---

# Feed Block Filtering

Blocking someone hides their posts and comments from everything you read. The `blocks(blockerId, blockedId)` rows that already gate friend requests and direct messages also filter the posts surface, keeping the one promise blocking makes.

## How it works

When the caller of `readPosts` is authenticated, the query adds `userId NOT IN (SELECT blockedId FROM blocks WHERE blockerId = viewer)` (`getNotBlockedWhere`) as a `RAW` clause beside the cursor clause. Comment listings run through the same procedure, so blocked users' comments disappear from threads too. Because the filter lives in the `where`, cursors stay consistent — pages simply skip blocked rows server-side.

Deliberate boundaries:

- **`readPost` stays readable** — navigating directly to a blocked user's post is an intentional act, and rate-limited/unauthenticated readers have no block list anyway. Only the feeds filter.
- **Hidden, not erased** — mutations, counters, and ranking are untouched: blocked users' likes and comments still count in `noLikes`/`noComments` (an off-by-N banner is cheaper than divergent counters).
- **Silent omission** — no "blocked content" placeholders, which would leak that a specific user posted.

## Key files

Paths relative to `packages/app`.

| File                                         | Role                               |
| -------------------------------------------- | ---------------------------------- |
| `server/services/post/getNotBlockedWhere.ts` | the `NOT IN` blocks subquery       |
| `server/trpc/routers/post.ts`                | block-aware `where` on `readPosts` |
| `server/trpc/routers/post.test.ts`           | block filtering coverage           |

## Notes

- One subquery per feed read against a tiny table — negligible; add an index on `blocks(blockerId)` only if it ever shows up in profiles.
