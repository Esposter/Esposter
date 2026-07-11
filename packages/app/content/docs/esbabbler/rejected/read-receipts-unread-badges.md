---
title: Read receipts / unread badges
description: Rejected — full per-message unread tracking; mention-only counts remain allowed.
---

# Read Receipts / Unread Badges

Track `lastSeenRowKey` / `lastSeenAt` per user per room to show per-room and per-DM unread counts.

**Why not**

- Read-receipt semantics do not fit a casual, always-scrolling UX.
- Background Postgres writes on every room switch / focus add noise for little gain.

**Allowed narrower version:** **mention-only** counts are fine and shipped as [mention badges](/docs/esbabbler/mention-badges): count chips for `@mentions` only, with a single per-room counter and no per-message read tracking.
