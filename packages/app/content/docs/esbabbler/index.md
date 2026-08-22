---
title: Esbabbler
description: Discord-like messaging area — rooms, direct messages, calls, moderation, and notifications.
---

# Esbabbler

Esbabbler is Esposter's messaging module: a Discord-like experience with rooms, 1:1 and group direct messages, drop-in audio/video calls, role-based moderation, and web push notifications.

**Design rule: match Discord by default.** Behaviour, structure, naming, defaults, and where each setting lives all follow Discord unless visual styling (Vuetify-defined) or the storage constraints below force a divergence.

## Key concepts

- **Room** — the container for a conversation. Rooms and direct messages share one `rooms` table, distinguished by `RoomType` (`Room` | `DirectMessage`). Membership lives in `usersToRooms`.
- **Storage split** — relational data (rooms, roles, bans, friends, settings, scheduled jobs) lives in Postgres; high-volume, time-ordered data (messages, moderation log) lives in Azure Table Storage with `partitionKey = roomId` and a reverse-ticked timestamp `rowKey` so newest rows sort first. See [messaging](/docs/esbabbler/messaging).
- **Real-time** — in-process Node `EventEmitter`s (`messageEventEmitter`, `roomEventEmitter`, `callEventEmitter`, …) drive tRPC subscriptions; Azure Web PubSub handles webhook delivery. Subscriptions are the source of truth for store mutations.
- **RBAC** — permissions are a bigint bitfield on room roles; every privileged procedure is gated through a permissions-aware procedure builder. See [RBAC](/docs/esbabbler/rbac).
- **Call session** — a call is anchored to a `callSessionsInMessage` row (12-character shareable id), not to a route. Room calls and standalone `/calls/[id]` share-link calls use the same session model. See [calls](/docs/esbabbler/calls).

## Pages

| Page                                                             | Covers                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| [messaging](/docs/esbabbler/messaging)                           | Message storage, send flow, message types, real-time fan-out      |
| [message list rendering](/docs/esbabbler/message-list-rendering) | Per-item weight budget, single-instance menu/dialogs, emoji index |
| [emoji](/docs/esbabbler/emoji)                                   | One emoji index — picker, reactions, `:` autocomplete, tones      |
| [custom emoji](/docs/esbabbler/custom-emoji)                     | Per-room uploads — count cap, id-keyed tag, content node          |
| [file & media](/docs/esbabbler/file-media)                       | Image thumbnails, per-room attachment limits, attachment browsing |
| [message search](/docs/esbabbler/message-search)                 | Right-sidebar search — filter chips, free text, search history    |
| [friends and DMs](/docs/esbabbler/friends-and-dms)               | Friend requests, blocking, 1:1 and group direct messages          |
| [RBAC](/docs/esbabbler/rbac)                                     | Roles, permission bitfield, hierarchy, procedure guards           |
| [moderation](/docs/esbabbler/moderation)                         | Admin actions, word filter, bans/timeouts, audit log              |
| [automod actions](/docs/esbabbler/automod-actions)               | Word-filter reject/warn/timeout actions via the admin machinery   |
| [moderator notes](/docs/esbabbler/moderator-notes)               | Private, append-only per-member moderator notes                   |
| [threads](/docs/esbabbler/threads)                               | Thread pane, its composer, thread calls, split view, thread route |
| [thread follows](/docs/esbabbler/thread-follows)                 | Follow threads, notify-on-reply, Followed Threads drawer          |
| [invites](/docs/esbabbler/invites)                               | Invite links with expiry and max-use options                      |
| [nicknames](/docs/esbabbler/nicknames)                           | Per-room nicknames and display-name resolution                    |
| [mention badges](/docs/esbabbler/mention-badges)                 | Mention-only unread counts in the room sidebar                    |
| [profiles and presence](/docs/esbabbler/profiles-and-presence)   | Profile card/editing and Online/Idle/DND/Offline presence         |
| [calls](/docs/esbabbler/calls)                                   | LiveKit sessions, membership boundary, knock lobby                |
| [call view](/docs/esbabbler/calls/call-view)                     | Call surface, prejoin/ready room, tiles, control bar              |
| [screen share](/docs/esbabbler/calls/screenshare)                | Screen-share tracks, presenter layout, moderation                 |
| [picture-in-picture](/docs/esbabbler/calls/picture-in-picture)   | Document PiP pop-out of the active call                           |
| [per-user volume](/docs/esbabbler/calls/per-user-volume)         | Per-participant in-call volume slider (client-only)               |
| [user settings](/docs/esbabbler/settings)                        | Message-scoped user settings dialog + `userSettingsInMessage`     |
| [room settings](/docs/esbabbler/room-settings)                   | Room settings dialog — Discord categories + permission gating     |
| [room UI](/docs/esbabbler/room-ui)                               | Room-shell polish — member grouping, resizable sidebars, density  |
| [voice & video settings](/docs/esbabbler/voice-video)            | Voice & Video panel and live LiveKit application                  |
| [push-to-talk](/docs/esbabbler/push-to-talk)                     | Hold-to-talk keybind, mic gate, release delay                     |
| [push notifications](/docs/esbabbler/push-notifications)         | Web push delivery and recipient filtering                         |
| [slash commands](/docs/esbabbler/slash-commands)                 | `/command` registry, picker, execution model                      |
| [scheduled messages](/docs/esbabbler/scheduled-messages)         | `/remind` + `/schedule` jobs and the Service Bus worker           |
| [drafts & sent](/docs/esbabbler/drafts-and-sent)                 | Cross-room Drafts / Scheduled / Sent view                         |
| [offline cache](/docs/esbabbler/offline-cache)                   | IndexedDB offline mirror of Pinia state                           |
| [webhooks](/docs/esbabbler/webhooks)                             | Inbound webhooks and their app-user bot identities                |
| [deferred](/docs/esbabbler/deferred)                             | Ideas deferred, each with a revisit trigger                       |
| [rejected](/docs/esbabbler/rejected)                             | Ideas decided against                                             |
| [roadmap](/docs/esbabbler/roadmap)                               | Open work — every item links its proposal                         |

## Shipped log

Chronological, one line per feature group.

- **Core messaging** — polls (`/poll`), emoji reactions, quote replies, typing indicators, edit/delete own messages, drafts, thread view, message grouping, jump-to-present, ↑-to-edit, code blocks, audio messages, file/image upload, rich link previews.
- **Search & navigation** — Ctrl+K command palette, filtered search (`from:`/`in:`/`before:`/`after:`), pinned messages list, unread room dot, jump-to-message, Copy Message Link, Mark Unread From Here.
- **Slash commands** — `/me` `/flip` `/shrug` `/tableflip` `/unflip` `/roll` `/topic` `/remind` `/schedule`.
- **Friends & DMs** — friends system, blocked users, 1:1 + group DMs, group-DM participant management, DM calls.
- **Mentions & notifications** — `@here`, `@everyone`, role mentions, mention highlighting, per-room notification preference, friend-request push notifications, mention badges (sidebar mention counts), thread follows with notify-on-reply and a Followed Threads drawer.
- **Presence & profiles** — Online/Idle/DND/Offline status, custom status message, profile card, profile editing (biography + avatar SAS upload), room profile image.
- **Rooms** — categories with drag-reorder, read-only/announcement channels, slowmode, per-room nicknames, welcome screen, join/leave system messages, invite expiry & max uses.
- **Moderation** — RBAC roles/permissions, force-mute, kick, ban/unban, timeout, warn, softban, word filter, automod word-filter actions (reject/warn/timeout), private moderator notes, audit log with action/actor/target filters.
- **Calls** — persistent per-room drop-in audio, LiveKit migration, video, screenshare, call lobby (knock & admit), deafen, raise-hand, call-health indicator, call-end duration system message, Document PiP pop-out, per-user volume, push-to-talk.
- **Integrations & infra** — inbound webhooks, offline message cache, scheduled messages (Service Bus worker + listing/cancel UI), Sent tab via Search index.
- **Store hygiene** — subscription-vs-caller ownership audit: every remote-visible message-store transition is owned by its subscription handler, caller-side mutations kept only for optimistic-with-revert or actor-excluded emits, locked in with idempotence tests.
- **File & media** — one shared SAS upload service, client-side image thumbnails rendered inline with the original in a lightbox, per-room attachment limits (max size + allowed MIME categories) in the Moderation settings, and a room's attachments browsable through the `has: file` search filter.
- **Settings** — message-scoped user-settings dialog (Voice & Video / Notifications / Keybinds) backed by `userSettingsInMessage`, applied live to LiveKit calls; push-to-talk keybind + release delay; room settings Discord-parity IA (category groups, Roles rename, Members/Invites tabs, Integrations + Moderation groups).
- **Custom emoji** — per-room uploaded emoji through the room's own settings panel: one `roomEmojis` table, a `ManageEmojis` bit with `Administrator` repinned to the column's ceiling so nothing shifts again, a count cap in place of any metering, `custom:{id}` reactions and an id-keyed content node that resolves to its image on render.
- **Emoji** — both emoji libraries retired for one in-repo index: a composition-API picker rendering native unicode with Discord's category rail, recents and single global skin tone, MiniSearch relevance shared with the composer's `:` autocomplete, and the Options API runtime, the CDN sprite sheet and the second dataset gone with them.
- **Room UI polish** — role-grouped member list with role-colored names, resizable persisted sidebars, Cozy/Compact message display (Appearance settings), room-list/search empty states, mobile bottom action bar, category drag-reorder with keyboard support.
