---
title: Viewer-scoped likes
description: Proposal — return only the viewer's like row per post instead of shipping every like.
---

# Viewer-Scoped Likes

Return each post with at most one like row — the viewer's — instead of all of them. `PostRelations = { likes: true }` loads and serializes **every** like of every post on every feed/comment read, purely so the client can color the viewer's arrows; a post with a thousand likes ships a thousand rows per feed page while the count already lives in the denormalized `noLikes`.

## Scope

**Today:** `readPosts`/`readPost` and every post/comment mutation return `PostWithRelations` (`likes: Like[]`, `user`). Client sites (`LikeSection`, `useLikeOperations`) scan `post.likes` for the session user's row.

**This adds:** a `viewerLike: Like | undefined` shape (or a `likes` relation filtered to the requesting user) and mechanical client updates. No schema change; `noLikes` already carries the count.

## How it works

- In the post procedures, filter the relation by the caller: unauthenticated readers get no like rows, authenticated ones get theirs (`likes: { where: { userId } }` in the relational query, or a follow-up keyed lookup if relation filters don't fit).
- `LikeSection` derives `liked`/`unliked` from the single row; `useLikeOperations` patches `viewerLike` instead of searching the array.
- Type: replace `PostWithRelations.likes: Like[]` with the scoped field so the compiler finds every consumer.

## Key files

Paths relative to `packages/app`.

| File                                                | Change                      |
| --------------------------------------------------- | --------------------------- |
| `packages/db-schema/src/relations/postsRelation.ts` | viewer-scoped relation/type |
| `server/trpc/routers/post.ts`                       | filter by `ctx` user        |
| `app/components/Post/LikeSection.vue`               | single-row derivation       |
| `app/composables/post/useLikeOperations.ts`         | patch `viewerLike`          |

## Notes

- Payload for a hot feed page drops from O(total likes) to O(posts) — the difference between the feed scaling with popularity and not.
- Rate-limited (unauthenticated) reads have no viewer, so they simply return no like row — the arrows render uncolored, which is already their logged-out behavior.
