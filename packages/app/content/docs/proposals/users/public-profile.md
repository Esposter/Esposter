---
title: Public profile
description: Proposal — a public user profile page showing identity, posts, and achievements.
---

# Public Profile

A `/user/[id]` page showing a user's avatar, name, biography, their posts, and their achievement showcase. Usernames render on every post and comment today but link nowhere — the social loop (see someone interesting → look at what else they've made) dead-ends.

## Scope

**Today:** identity fields exist and are editable ([users](/docs/users)); `achievement.readUserAchievements` already accepts any user id; `post.readPosts` filters by `parentId` but not by author.

**This adds:** a profile page, a `userId` filter on `post.readPosts`, and author links on post/comment cards. No new tables.

## How it works

- **Procedure** — extend `readPostsInputSchema` with an optional `userId`; when present, add `userId: { eq }` to the relations filter (composes with the existing `parentId` + cursor clauses). A separate light `user.readUser(id)` query serves the public identity fields. "Never email" is enforced server-side: the procedure selects **only** the allowlisted columns (name, image, biography, createdAt) in the Drizzle query projection — it never loads or serializes the full user row and relies on nothing client-side to strip private fields. It runs on the public rate-limited procedure (no session required), and the column allowlist plus unauthenticated access are acceptance criteria for the implementation.
- **Page** — `/user/[id]`: identity header, achievement points + recent unlocks (reusing the gallery's grid items via `readUserAchievements`), and a cursor-paginated post list reusing the feed's card + waypoint machinery with the `userId` filter.
- **Links** — post/comment cards' author name/avatar becomes a `NuxtLink` to the profile; esbabbler surfaces deliberately keep their own member-profile popovers (room identity ≠ global identity, per nickname/persona rules).

## Key files

Paths relative to `packages/app`.

| File                           | Change                         |
| ------------------------------ | ------------------------------ |
| `server/trpc/routers/post.ts`  | `userId` filter on `readPosts` |
| `server/trpc/routers/user.ts`  | public `readUser` query        |
| `app/pages/user/[id].vue`      | the profile page               |
| `app/components/Post/Card.vue` | author link                    |

## Notes

- Respect [feed block filtering](/docs/posts/feed-block-filtering), which is already in place — a blocked author's profile stays reachable by direct navigation (same permalink semantics), but their posts stay hidden from feeds.
- Comments are intentionally excluded from the profile's post list (`parentId IS NULL`) — a stream of context-free comments reads as noise; revisit with a tab if asked for.
