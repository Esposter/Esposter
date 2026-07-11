---
title: Esbabbler
description: Discord-like messaging area — rooms, direct messages, calls, moderation, and notifications.
---

# Esbabbler

Esbabbler is Esposter's messaging module: a Discord-like experience with rooms, 1:1 and group direct messages, drop-in audio/video calls, role-based moderation, and web push notifications.

**Design rule: match Discord by default.** Behaviour, structure, naming, defaults, and where each setting lives all follow Discord unless visual styling (Vuetify-defined) or the storage constraints below force a divergence.

## Key concepts

- **Room** — the container for a conversation. Rooms and direct messages share one `rooms` table, distinguished by `RoomType` (`Room` | `DirectMessage`). Membership lives in `usersToRooms`.
- **Storage split** — relational data (rooms, roles, bans, friends, settings, scheduled jobs) lives in Postgres; high-volume, time-ordered data (messages, moderation log) lives in Azure Table Storage with `partitionKey = roomId` and a reverse-ticked timestamp `rowKey` so newest rows sort first. See [/docs/esbabbler/messaging](/docs/esbabbler/messaging).
- **Real-time** — in-process Node `EventEmitter`s (`messageEventEmitter`, `roomEventEmitter`, `callEventEmitter`, …) drive tRPC subscriptions; Azure Web PubSub handles webhook delivery. Subscriptions are the source of truth for store mutations.
- **RBAC** — permissions are a bigint bitfield on room roles; every privileged procedure is gated through a permissions-aware procedure builder. See [/docs/esbabbler/rbac](/docs/esbabbler/rbac).
- **Call session** — a call is anchored to a `callSessionsInMessage` row (12-character shareable id), not to a route. Room calls and standalone `/calls/[id]` share-link calls use the same session model. See [/docs/esbabbler/calls](/docs/esbabbler/calls).

## Pages

| Page                                                                                 | Covers                                                        |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [/docs/esbabbler/messaging](/docs/esbabbler/messaging)                               | Message storage, send flow, message types, real-time fan-out  |
| [/docs/esbabbler/friends-and-dms](/docs/esbabbler/friends-and-dms)                   | Friend requests, blocking, 1:1 and group direct messages      |
| [/docs/esbabbler/rbac](/docs/esbabbler/rbac)                                         | Roles, permission bitfield, hierarchy, procedure guards       |
| [/docs/esbabbler/moderation](/docs/esbabbler/moderation)                             | Admin actions, word filter, bans/timeouts, audit log          |
| [/docs/esbabbler/nicknames](/docs/esbabbler/nicknames)                               | Per-room nicknames and display-name resolution                |
| [/docs/esbabbler/mention-badges](/docs/esbabbler/mention-badges)                     | Mention-only unread counts in the room sidebar                |
| [/docs/esbabbler/profiles-and-presence](/docs/esbabbler/profiles-and-presence)       | Profile card/editing and Online/Idle/DND/Offline presence     |
| [/docs/esbabbler/calls](/docs/esbabbler/calls)                                       | LiveKit sessions, membership boundary, knock lobby            |
| [/docs/esbabbler/calls/call-view](/docs/esbabbler/calls/call-view)                   | Call surface, prejoin/ready room, tiles, control bar          |
| [/docs/esbabbler/calls/screenshare](/docs/esbabbler/calls/screenshare)               | Screen-share tracks, presenter layout, moderation             |
| [/docs/esbabbler/calls/picture-in-picture](/docs/esbabbler/calls/picture-in-picture) | Document PiP pop-out of the active call                       |
| [/docs/esbabbler/settings](/docs/esbabbler/settings)                                 | Message-scoped user settings dialog + `userSettingsInMessage` |
| [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video)                           | Voice & Video panel and live LiveKit application              |
| [/docs/esbabbler/push-to-talk](/docs/esbabbler/push-to-talk)                         | Hold-to-talk keybind, mic gate, release delay                 |
| [/docs/esbabbler/push-notifications](/docs/esbabbler/push-notifications)             | Web push delivery and recipient filtering                     |
| [/docs/esbabbler/slash-commands](/docs/esbabbler/slash-commands)                     | `/command` registry, picker, execution model                  |
| [/docs/esbabbler/scheduled-messages](/docs/esbabbler/scheduled-messages)             | `/remind` + `/schedule` jobs and the Service Bus worker       |
| [/docs/esbabbler/drafts-and-sent](/docs/esbabbler/drafts-and-sent)                   | Cross-room Drafts / Scheduled / Sent view                     |
| [/docs/esbabbler/offline-cache](/docs/esbabbler/offline-cache)                       | IndexedDB offline mirror of Pinia state                       |
| [/docs/esbabbler/deferred](/docs/esbabbler/deferred)                                 | Ideas deferred, each with a revisit trigger                   |
| [/docs/esbabbler/rejected](/docs/esbabbler/rejected)                                 | Ideas decided against                                         |
| [/docs/esbabbler/roadmap](/docs/esbabbler/roadmap)                                   | Open work — every item links its proposal                     |

## Shipped log

Chronological, one line per feature group.

- **Core messaging** — polls (`/poll`), emoji reactions, quote replies, typing indicators, edit/delete own messages, drafts, thread view, message grouping, jump-to-present, ↑-to-edit, code blocks, audio messages, file/image upload, rich link previews.
- **Search & navigation** — Ctrl+K command palette, filtered search (`from:`/`in:`/`before:`/`after:`), pinned messages list, unread room dot, jump-to-message, Copy Message Link, Mark Unread From Here.
- **Slash commands** — `/me` `/flip` `/shrug` `/tableflip` `/unflip` `/roll` `/topic` `/remind` `/schedule`.
- **Friends & DMs** — friends system, blocked users, 1:1 + group DMs, group-DM participant management, DM calls.
- **Mentions & notifications** — `@here`, `@everyone`, role mentions, mention highlighting, per-room notification preference, friend-request push notifications, mention badges (sidebar mention counts).
- **Presence & profiles** — Online/Idle/DND/Offline status, custom status message, profile card, profile editing (biography + avatar SAS upload), room profile image.
- **Rooms** — categories with drag-reorder, read-only/announcement channels, slowmode, per-room nicknames, welcome screen, join/leave system messages.
- **Moderation** — RBAC roles/permissions, force-mute, kick, ban/unban, timeout, warn, softban, word filter, audit log.
- **Calls** — persistent per-room drop-in audio, LiveKit migration, video, screenshare, call lobby (knock & admit), deafen, raise-hand, call-health indicator, call-end duration system message, Document PiP pop-out.
- **Integrations & infra** — inbound webhooks, offline message cache, scheduled messages (Service Bus worker + listing/cancel UI), Sent tab via Search index.
- **Settings** — message-scoped user-settings dialog (Voice & Video / Notifications / Keybinds) backed by `userSettingsInMessage`, applied live to LiveKit calls; push-to-talk keybind + release delay.
