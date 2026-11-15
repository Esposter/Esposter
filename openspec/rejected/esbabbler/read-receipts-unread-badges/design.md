# Read Receipts / Unread Badges

Track the last message each user has seen in each room, and when, to show per-room and per-DM unread counts.

**Why not**

- Read-receipt semantics do not fit a casual, always-scrolling UX.
- Background writes on every room switch / focus add noise for little gain.

**Allowed narrower version:** **mention-only** counts are fine and shipped as [mention badges](../../../specs/esbabbler/mention-badges/design.md): count chips for `@mentions` only, with a single per-room counter and no per-message read tracking.
