---
title: Feed block filtering
description: Proposal — hide posts and comments from users the viewer has blocked.
---

# Feed Block Filtering

Exclude blocked users' posts and comments from what a viewer reads. Blocking exists (`block` router: block/unblock/list, used by friends/DMs) but the posts surface ignores it — blocking someone today still shows you everything they post, which breaks the one promise blocking makes.

## Scope

**Today:** `blocks(blockerId, blockedId)` rows exist and gate friend requests/DMs. `readPosts`/`readPost` filter only by `parentId`.

**This adds:** a viewer-block filter on the post read path. Mutations, counters, and ranking are untouched — blocked users' likes/comments still count in totals (they're hidden, not erased).

## How it works

- In `readPosts`, when the caller is authenticated, add `userId NOT IN (select blockedId from blocks where blockerId = viewer)` to the relations filter (a `RAW` clause beside the existing cursor clause, or a relational `notExists`).
- Same filter on the comment listing (it is the same procedure) — blocked users' comments disappear from threads; `noComments` intentionally keeps counting them (an off-by-N banner is cheaper than divergent counters).
- `readPost` (direct permalink): keep readable — navigating explicitly to a blocked user's post is an intentional act, and rate-limited/unauthenticated readers have no block list anyway. Only the feeds filter.
- Pagination interplay: filtering happens in the `where`, so cursors stay consistent — pages just skip blocked rows server-side.

## Key files

Paths relative to `packages/app`.

| File                               | Change                             |
| ---------------------------------- | ---------------------------------- |
| `server/trpc/routers/post.ts`      | block-aware `where` on `readPosts` |
| `server/trpc/routers/post.test.ts` | block filtering coverage           |

## Notes

- One subquery per feed read against a tiny table — negligible; add an index on `blocks(blockerId)` only if it ever shows up in profiles.
- Deliberately no "blocked content" placeholders — silent omission is the standard, and placeholders leak that a specific user posted.
