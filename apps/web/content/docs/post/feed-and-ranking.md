---
title: Feed and ranking
description: The home feed's cursor pagination, its sort, and the stored Reddit-style hot score.
---

# Feed and Ranking

The home page renders top-level posts across the page's width, with infinite scroll and a Reddit-style Hot / New / Top sort, backed by cursor pagination over a stored ranking score.

## How it works

```mermaid
flowchart LR
  sortSelect[Hot / New / Top sort select] -->|sortType| store[post store<br/>items + hasMore + sortType]
  page[pages/index.vue] -->|readPosts + sortBy| store
  waypoint[StyledWaypoint at list end] -->|readMorePosts + cursor| store
  store --> proc[post.readPosts<br/>cursor pagination + viewer block filter]
  proc --> pg[(posts, parentId IS NULL)]
  mutation[likes / comments] -->|transactional| counters[likeCount, commentCount, ranking]
  counters --> pg
```

**Pagination** — `readPosts` takes cursor pagination params (default sort: `ranking` desc with the unique `id` as tiebreaker), fetches `limit + 1` rows to detect `hasMore`, and returns a cursor for the next page — the app-standard cursor pattern (`getCursorWhere` / `getCursorPaginationData`). Compound sort keys compare lexicographically — `(k1 < v1) OR (k1 = v1 AND k2 < v2)` — so pages of tied values (every new post has `likeCount = 0`) never skip rows. The same procedure serves comment lists via the `parentId` filter.

**Sort options** — a "Sort by" select on the feed's toolbar, beside Create post, switches between Hot (`ranking` desc), New (`createdAt` desc), and Top (`likeCount` desc, all-time), each mapped to a `sortBy` by `PostSortTypeSortByMap` with `id` as second key. The chosen sort lives in the post store; switching clears the list and refetches page one, and the waypoint continues from the new cursor. Comments keep their fixed sort.

**Block filtering** — authenticated feed reads exclude posts and comments authored by users the viewer has blocked — see [feed block filtering](/docs/post/feed-block-filtering).

**Ranking** — the hot score is computed at write time, never re-read:

```text
sign(likes) × log10(max(|likes|, 1)) + max(0, createdAtMs − 1.5e12) / 45e6
```

The log term means early likes matter most; the time term gives newer posts a constant head start (each ~12.5 hours of age is worth one order of magnitude of likes). Because age is baked in as an absolute offset, scores never need recomputation — newer posts simply start higher. Every like create/update/delete and comment create recomputes the score in the same transaction that updates the counters.

**Feed UI** — the page's full width: the toolbar, a card per post (who and when with the author's actions at the end, the post, then the vote pill and the comment count), and a `StyledWaypoint` sentinel at the bottom that triggers `readMorePosts` while `hasMore` holds. The page scrolls the document, so pulling to refresh is the browser's own, which reloads the feed.

## Procedures

| Procedure        | Auth         | Input                               | Purpose                      |
| ---------------- | ------------ | ----------------------------------- | ---------------------------- |
| `post.readPosts` | rate-limited | cursor params + optional `parentId` | one feed/comment page        |
| `post.readPost`  | rate-limited | post id                             | single post for `/post/[id]` |

## Key files

Paths relative to `apps/web`.

| File                                         | Role                                 |
| -------------------------------------------- | ------------------------------------ |
| `app/pages/index.vue`                        | the feed page                        |
| `app/components/Post/List.vue`               | the toolbar, the cards, the waypoint |
| `app/composables/post/useReadPosts.ts`       | initial read + read-more, `sortBy`   |
| `app/store/post/index.ts`                    | feed items store + `sortType`        |
| `app/services/post/PostSortTypeSortByMap.ts` | sort → `sortBy` mapping              |
| `server/trpc/routers/post.ts`                | `readPosts` / `readPost`             |
| `server/services/post/getPostRanking.ts`     | the hot score                        |
| `server/services/pagination/cursor/`         | shared cursor pagination helpers     |

## Notes

- Top is all-time (no time windows) — casual scale doesn't need "top this week" partitioning yet; revisit if the feed ages badly.
- Every post ships at most the viewer's own like row (`viewerLike`) — see [likes](/docs/post/likes) for the viewer-scoped read contract.
