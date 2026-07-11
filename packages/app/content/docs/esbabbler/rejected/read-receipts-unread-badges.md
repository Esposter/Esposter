---
title: Read receipts / unread badges
description: Rejected — full per-message unread tracking; mention-only counts remain allowed.
---

# Read Receipts / Unread Badges

Track `lastSeenRowKey` / `lastSeenAt` per user per room to show per-room and per-DM unread counts.

**Why not**

- Read-receipt semantics do not fit a casual, always-scrolling UX.
- Background Postgres writes on every room switch / focus add noise for little gain.

**Allowed narrower version:** **mention-only** counts are fine (the "mention badges" roadmap item): count chips for `@mentions` only, reusing message metadata + `usersToRooms.lastMessageAt`. That is scoped, not full per-message unread tracking.
