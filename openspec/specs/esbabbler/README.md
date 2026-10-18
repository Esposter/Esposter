# Esbabbler

Esbabbler is Esposter's messaging module: a Discord-like experience with rooms, 1:1 and group direct messages, drop-in audio/video calls, role-based moderation, and web push notifications.

**Design rule: match Discord by default.** Behaviour, structure, naming, defaults, and where each setting lives all follow Discord unless visual styling (the [design language](../architecture/design-language/design.md)'s) or the storage constraints below force a divergence.

## Key concepts

- **Room** — the container for a conversation. Rooms and direct messages share one `rooms` table, distinguished by `RoomType` (`Room` | `DirectMessage`). Membership lives in `usersToRooms`.
- **Storage split** — relational data (rooms, roles, bans, friends, settings, scheduled jobs) lives in Postgres; high-volume, time-ordered data (messages, moderation log) lives in Azure Table Storage with `partitionKey = roomId` and a reverse-ticked timestamp `rowKey` so newest rows sort first. See [messaging](messaging/design.md).
- **Real-time** — in-process Node `EventEmitter`s (`messageEventEmitter`, `roomEventEmitter`, `callEventEmitter`, …) drive tRPC subscriptions; Azure Web PubSub handles webhook delivery. Subscriptions are the source of truth for store mutations.
- **RBAC** — permissions are a bigint bitfield on room roles; every privileged procedure is gated through a permissions-aware procedure builder. See [RBAC](rbac/design.md).
- **Call session** — a call is anchored to a `callSessionsInMessage` row (12-character shareable id), not to a route. Room calls and standalone `/calls/[id]` share-link calls use the same session model. See [calls](calls/README.md).

## Pages

| Page                                                                 | Covers                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [messaging](messaging/design.md)                                     | Message storage, send flow, message types, real-time fan-out       |
| [message list rendering](message-list-rendering/design.md)           | Per-item weight budget, single-instance menu/dialogs, emoji index  |
| [message list scrolling](message-list-scrolling/design.md)           | Present detection, jump-to-present, newer-page anchor compensation |
| [emoji](emoji/design.md)                                             | One emoji index — picker, reactions, `:` autocomplete, tones       |
| [custom emoji](custom-emoji/design.md)                               | Per-room uploads — count cap, id-keyed tag, content node           |
| [file & media](file-media/design.md)                                 | Image thumbnails, per-room attachment limits, attachment browsing  |
| [code viewer](code-viewer/design.md)                                 | Read-only code attachments, grammar by filename, the app's theme   |
| [spoilers](spoilers/design.md)                                       | Text and attachment spoilers, hidden until a reader reveals them   |
| [message search](message-search/design.md)                           | Right-sidebar search — filter chips, free text, search history     |
| [friends and DMs](friends-and-dms/design.md)                         | Friend requests, blocking, 1:1 and group direct messages           |
| [RBAC](rbac/design.md)                                               | Roles, permission bitfield, hierarchy, procedure guards            |
| [member permission overrides](member-permission-overrides/design.md) | One member's allow and deny bits, folded into their permissions    |
| [moderation](moderation/design.md)                                   | Admin actions, word filter, bans/timeouts, audit log               |
| [automod actions](automod-actions/design.md)                         | Word-filter reject/warn/timeout actions via the admin machinery    |
| [moderator notes](moderator-notes/design.md)                         | Private, append-only per-member moderator notes                    |
| [threads](threads/design.md)                                         | Thread pane, its composer, thread calls, split view, thread route  |
| [thread follows](thread-follows/design.md)                           | Follow threads, notify-on-reply, Followed Threads drawer           |
| [invites](invites/design.md)                                         | Invite links with expiry and max-use options                       |
| [display names](nicknames/design.md)                                 | Per-room display names and resolution                              |
| [mention badges](mention-badges/design.md)                           | Mention-only unread counts in the room sidebar                     |
| [profiles and presence](profiles-and-presence/design.md)             | Profile card/editing and Online/Idle/DND/Offline presence          |
| [calls](calls/README.md)                                             | LiveKit sessions, membership boundary, knock lobby                 |
| [call view](calls/call-view/design.md)                               | Call surface, prejoin/ready room, tiles, control bar               |
| [screen share](calls/screenshare/design.md)                          | Screen-share tracks, presenter layout, moderation                  |
| [picture-in-picture](calls/picture-in-picture/design.md)             | Document PiP pop-out of the active call                            |
| [per-user volume](calls/per-user-volume/design.md)                   | Per-participant in-call volume slider (client-only)                |
| [user settings](settings/design.md)                                  | Message-scoped user settings dialog + `userSettingsInMessage`      |
| [room settings](room-settings/design.md)                             | Room settings dialog — Discord categories + permission gating      |
| [room UI](room-ui/design.md)                                         | Room-shell polish — member grouping, resizable sidebars, density   |
| [voice & video settings](voice-video/design.md)                      | Voice & Video panel and live LiveKit application                   |
| [push-to-talk](push-to-talk/design.md)                               | Hold-to-talk keybind, mic gate, release delay                      |
| [push notifications](push-notifications/design.md)                   | Web push delivery and recipient filtering                          |
| [slash commands](slash-commands/design.md)                           | `/command` registry, picker, execution model                       |
| [scheduled messages](scheduled-messages/design.md)                   | `/remind` + `/schedule` jobs and the Service Bus worker            |
| [drafts & sent](drafts-and-sent/design.md)                           | Cross-room Drafts / Scheduled / Sent view                          |
| [offline cache](offline-cache/design.md)                             | IndexedDB offline mirror of Pinia state                            |
| [webhooks](webhooks/design.md)                                       | Inbound webhooks and their app-user bot identities                 |
| [deferred](../../deferred/esbabbler/)                                | Ideas deferred, each with a revisit trigger                        |
| [rejected](../../rejected/esbabbler/)                                | Ideas decided against                                              |
| [roadmap](../../changes/esbabbler-roadmap/tasks.md)                  | Open work — every item links its proposal                          |

## Shipped log

Chronological, one line per feature group.

- **Core messaging** — polls (`/poll`), emoji reactions, quote replies, typing indicators, edit/delete own messages, drafts, thread view, message grouping, jump-to-present, ↑-to-edit, code blocks, audio messages, file/image upload, rich link previews.
- **Spoilers** — `||text||`, `/spoiler`, Ctrl+Shift+S, push masking, and blurred attachments revealed on activation.
- **Search & navigation** — Ctrl+K command palette, filtered search (`from:`/`in:`/`before:`/`after:`), pinned messages list, unread room dot, jump-to-message, Copy Message Link, Mark Unread From Here.
- **Slash commands** — `/me` `/flip` `/shrug` `/tableflip` `/unflip` `/roll` `/topic` `/remind` `/schedule`.
- **Friends & DMs** — friends system, blocked users, 1:1 + group DMs, group-DM participant management, DM calls.
- **Mentions & notifications** — `@here`, `@everyone`, role mentions, mention highlighting, per-room notification preference, friend-request push notifications, mention badges (sidebar mention counts), thread follows with notify-on-reply and a Followed Threads drawer.
- **Presence & profiles** — Online/Idle/DND/Offline status, custom status message, profile card, profile editing (biography + avatar SAS upload), room profile image.
- **Rooms** — categories with drag-reorder, read-only/announcement channels, slowmode, per-room display names, welcome screen, join/leave system messages, invite expiry & max uses.
- **Moderation** — RBAC roles/permissions, force-mute, kick, ban/unban, timeout, warn, softban, word filter, automod word-filter actions (reject/warn/timeout), private moderator notes, audit log with action/actor/target filters.
- **Calls** — persistent per-room drop-in audio, LiveKit migration, video, screenshare, call lobby (knock & admit), deafen, raise-hand, call-health indicator, call-end duration system message, Document PiP pop-out, per-user volume, push-to-talk.
- **Integrations & infra** — inbound webhooks, offline message cache, scheduled messages (Service Bus worker + listing/cancel UI), Sent tab via Search index.
- **Store hygiene** — subscription-vs-caller ownership audit: every remote-visible message-store transition is owned by its subscription handler, caller-side mutations kept only for optimistic-with-revert or actor-excluded emits, locked in with idempotence tests.
- **File & media** — one shared SAS upload service, client-side image thumbnails rendered inline with the original in a lightbox, per-room attachment limits (max size + allowed MIME categories) in the Moderation settings, and a room's attachments browsable through the `has: file` search filter.
- **Settings** — user settings and room settings both landed on Discord's own information architecture, so where a setting lives is a lookup rather than a decision.
- **Custom emoji** — per-room uploads reused the emoji index rather than growing a second path, and are capped by count rather than metered, so the feature cost one table and no billing surface.
- **Emoji** — both emoji libraries retired for one in-repo index, taking the Options API runtime, the CDN sprite sheet and the second dataset with them.
- **Room UI polish** — role-grouped member list with role-colored names, resizable persisted sidebars, Cozy/Compact message display (Appearance settings), room-list/search empty states, mobile bottom action bar, category drag-reorder with keyboard support.
