# Read Receipts / Unread Badges

Track `lastSeenRowKey` / `lastSeenAt` per user per room to show per-room and per-DM unread counts.

## Why not

- Read-receipt semantics do not fit a casual, always-scrolling UX.
- Background Postgres writes on every room switch / focus add noise for little gain.

## Allowed narrower version

**Mention-only** counts are fine (v7 "Mention badges in the sidebar"): count chips for `@mentions` only, reusing message metadata + `usersToRooms.lastMessageAt`. That is scoped, not full per-message unread tracking.
