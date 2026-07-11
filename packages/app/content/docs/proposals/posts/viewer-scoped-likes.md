---
title: Viewer-scoped likes
description: Proposal — return only the viewer's like row per post instead of shipping every like.
---

# Viewer-Scoped Likes

Return each post with at most one like row — the viewer's — instead of all of them. `PostRelations = { likes: true }` loads and serializes **every** like of every post on every feed/comment read, purely so the client can color the viewer's arrows; a post with a thousand likes ships a thousand rows per feed page while the count already lives in the denormalized `noLikes`.

## Scope

**Today:** `readPosts`/`readPost` and every post/comment mutation return `PostWithRelations` (`likes: Like[]`, `user`). Client sites (`LikeSection`, `useLikeOperations`) scan `post.likes` for the session user's row.

**This adds:** one canonical response shape — `viewerLike: Like | undefined` **replaces** `likes: Like[]` on `PostWithRelations` — applied uniformly to every procedure that returns a post (reads and mutations alike), plus mechanical client updates. A filtered `likes` relation is only the server-side fetch strategy, never a second API shape. No schema change; `noLikes` already carries the count.

## How it works

- **Server** — `readPost`/`readPosts` run through the public rate-limited procedure, so a session may be absent. Branch explicitly: no session → skip the like lookup entirely and return `viewerLike: undefined`; session present → fetch the caller's row (`likes: { where: { userId } }` in the relational query, or a follow-up keyed lookup if relation filters don't fit) and map it to `viewerLike`. Post/comment mutations (which are authenticated) map the same way, so every endpoint emits the identical shape.
- **Client** — `LikeSection` derives `liked`/`unliked` from the single row; `useLikeOperations` patches `viewerLike` instead of searching the array.
- **Type** — replace `PostWithRelations.likes: Like[]` with `viewerLike: Like | undefined` so the compiler finds every consumer.

## Key files

Paths relative to `packages/app`.

| File                                          | Change                      |
| --------------------------------------------- | --------------------------- |
| `../db-schema/src/relations/postsRelation.ts` | viewer-scoped relation/type |
| `server/trpc/routers/post.ts`                 | filter by `ctx` user        |
| `app/components/Post/LikeSection.vue`         | single-row derivation       |
| `app/composables/post/useLikeOperations.ts`   | patch `viewerLike`          |

## Notes

- Payload for a hot feed page drops from O(total likes) to O(posts) — the difference between the feed scaling with popularity and not.
- Rate-limited (unauthenticated) reads have no viewer, so they simply return no like row — the arrows render uncolored, which is already their logged-out behavior.
