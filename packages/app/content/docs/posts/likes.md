---
title: Likes
description: The ±1 like model, transactional counter and ranking updates, and the optimistic client stores.
---

# Likes

Reddit-style voting: each user holds at most one like per post with `value ∈ {1, −1}`, shown as up/down arrows on every post and comment card beside the net count.

## How it works

**Model** — `likes(userId, postId, value)` with a composite primary key (one row per user per post) and a DB check constraining `value` to ±1. The post's `noLikes` is the denormalized net sum.

**Mutations** — three procedures, each a transaction that writes the like row, adjusts `noLikes`, and recomputes the stored [ranking](/docs/posts/feed-and-ranking) from the new count:

- `createLike` — first vote (`noLikes += value`).
- `updateLike` — flip an existing vote (`noLikes += 2 × value`, rejecting no-op flips).
- `deleteLike` — retract (`noLikes −= value`).

**Viewer-scoped reads** — every procedure that returns a post (reads and mutations alike) carries `viewerLike: Like | undefined` on `PostWithRelations`: at most the viewer's own like row, never the full list, since the net count already lives in the denormalized `noLikes`. The `likes` relation is only the server-side fetch strategy — `getViewerPostRelations` filters it to the caller, and `getPostWithViewerLike` maps the result. Unauthenticated rate-limited reads have no viewer, so they skip the like lookup entirely and the arrows render uncolored. A hot feed page's payload is O(posts) instead of O(total likes).

**Client** — `LikeSection.vue` derives `liked`/`unliked` from `viewerLike`, and maps arrow clicks to the right mutation (up while unliked = flip, up while liked = retract, …). `useLikeOperations` applies the result optimistically to whichever store owns the list (feed posts vs a post page's comments — two store instances of the same shape), patching `viewerLike` and `noLikes` in place so counts update without a refetch.

## Procedures

| Procedure         | Auth   | Input             | Purpose      |
| ----------------- | ------ | ----------------- | ------------ |
| `like.createLike` | authed | postId, value(±1) | first vote   |
| `like.updateLike` | authed | postId, value(±1) | flip vote    |
| `like.deleteLike` | authed | postId            | retract vote |

## Key files

Paths relative to `packages/app`, except those starting with `packages/`, which are relative to the repo root.

| File                                                       | Role                                 |
| ---------------------------------------------------------- | ------------------------------------ |
| `packages/db-schema/src/schema/likes.ts`                   | table + ±1 check                     |
| `packages/db-schema/src/relations/postsRelation.ts`        | `PostWithRelations` + `viewerLike`   |
| `server/trpc/routers/like.ts`                              | transactional mutations              |
| `server/services/post/getViewerPostRelations.ts`           | viewer-filtered likes fetch strategy |
| `server/services/post/getPostWithViewerLike.ts`            | maps the fetched row to `viewerLike` |
| `app/components/Post/LikeSection.vue`                      | arrows UI + state derivation         |
| `app/composables/post/useLikeOperations.ts`                | optimistic store patching            |
| `app/store/post/like.ts`, `app/store/post/comment/like.ts` | per-list like stores                 |

## Notes

- Like achievements (`LikeAchievementDefinitionMap`) trigger on these procedure paths like all achievement definitions.
