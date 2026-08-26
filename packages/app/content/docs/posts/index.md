---
title: Posts
description: The core posting product — the home feed, Reddit-style ranking, comments, and likes.
---

# Posts

Posts are Esposter's core product — "a nice and casual place for posting random things". The home page (`/`) is an infinite feed of posts ranked hot-first; each post has a title, rich-text description, up/down likes, and a comment section at `/post/[id]`.

## Key concepts

- **Comments are posts** — one `posts` table, self-referencing: a comment is a row with a `parentId` (and `depth = parent + 1`); top-level posts have `parentId = null` and a required title. One model, one router, shared machinery — and a reply tree that needs no route of its own, since a comment already has a page.
- **Denormalized counters** — `noLikes` and `noComments` live on the post row and are updated transactionally with every like/comment mutation, so feed cards never aggregate. A comment write moves `noComments` on every post above it, named by the `ancestorIds` chain the row carries rather than found by walking `parentId`.
- **Stored ranking** — a Reddit-style hot score computed at write time and stored on the row, so the feed is a simple indexed sort. See [feed and ranking](/docs/posts/feed-and-ranking).
- **Profanity filtering** — every create/update of user text goes through `getProfanityFilterProcedure`, which censors configured input fields in middleware before the mutation runs.
- **Achievements** — post, comment, and like actions feed a rich set of achievement definitions (including condition-based ones like "50 comments under 50 characters") through the tRPC-path plugin.

## Pages

- [Feed and ranking](/docs/posts/feed-and-ranking) — the home feed, sort options, cursor pagination, and the hot score.
- [Posts and comments](/docs/posts/posts-and-comments) — CRUD, the self-referencing model, rich text.
- [Likes](/docs/posts/likes) — the ±1 like model, viewer-scoped reads, and transactional counter updates.
- [Feed block filtering](/docs/posts/feed-block-filtering) — blocked users' posts and comments are hidden from feeds.

Open work: [roadmap](/docs/posts/roadmap). Decided ideas: [deferred](/docs/posts/deferred), [rejected](/docs/posts/rejected).

## Shipped log

- **Feed reads** — viewer-scoped likes (one like row per post instead of all of them), Hot / New / Top sort toggle, blocked-user filtering, lexicographic compound cursors.
