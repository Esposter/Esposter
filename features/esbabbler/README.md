# Esbabbler

Messaging, calls, rooms, moderation, and DMs — a casual Discord-style community app. Goal: durable and polished without expensive infrastructure or undoing the Postgres / Azure Table storage split.

This README is the index. Detail lives in the linked files; nothing is duplicated here.

## Now

In active development:

- 🔨 **Scheduled-jobs listing/cancel UI** — backend (schema, API, queue worker, `/remind` + `/schedule` dialogs) done; the listing/cancel UI is the remaining gap. DB migration for `scheduledMessageJobsInMessage` still pending. → [specs/scheduled-messages.md](specs/scheduled-messages.md), [specs/drafts-and-sent.md](specs/drafts-and-sent.md)

## Roadmap

Ordered backlog, not started. Implement top-down — early items stay local/user-visible, later items add background/cross-process work.

1. **Community events** — RSVP-able scheduled room events; reuses the scheduled-job worker; needs the `ManageEvents` permission-bitfield migration. → [specs/community-events.md](specs/community-events.md)
   - Do the bitfield-shift migration **once**: add `ManageEvents` **and** `SpeakInStage` together. The LiveKit publish-gating needed for [stage mode](deferred/stage-mode.md) is already proven by the `StopScreenShare` admin action, so stage mode becomes nearly free to follow once the permission exists.
2. **Voice/call polish** — call-notes system message, push-to-talk, Picture-in-Picture ([specs/picture-in-picture.md](specs/picture-in-picture.md)). (Raise-hand + call-health indicator already shipped.)
3. **Mention badges & thread follows** — mention-only sidebar counts; `threadFollowsInMessage` + notify-on-reply; "Threads" drawer filter (open/followed/participated).
4. **Moderation/safety upgrades** — moderator notes; automod actions on `roomFiltersInMessage` (reject/warn/timeout); raid mode; audit-log filters; softban preview.
5. **Room/sidebar UI polish** — density toggle, resizable persisted sidebars, category drag-ordering, role-colored member grouping, better empty states, mobile action bar, room header overflow menu.
6. **File/media** — client-side image thumbnails before upload; room attachment limits + MIME categories; "files in this room" filter; Blob lifecycle notes. (Note: thumbnails were dropped in early planning; reopened here.)
7. **Subscription/store cleanup pass** — finish auditing duplicated caller-side store mutations; add tests around stores that mutate in both wrappers and subscription handlers.
8. **Search index ownership** — admin-only index status/rebuild tooling; document the `messages-index` schema in `architecture.md`.

## Shipped

Chronological. One line per feature; detail in the linked spec/reference/architecture file.

**Core messaging** — polls (`/poll`), emoji reactions, quote replies, typing indicators, edit/delete own messages, message drafts, thread view, message grouping, jump-to-present, ↑-to-edit, code blocks, audio messages, file/image upload (→ [architecture/file-uploads.md](../../architecture/file-uploads.md)), rich link previews.

**Search & navigation** — Ctrl+K command palette, filtered search (`from:`/`in:`/`before:`/`after:`), pinned messages list, unread room dot, jump-to-message + Copy Message Link + Mark Unread From Here.

**Slash commands** — `/me` `/flip` `/shrug` `/tableflip` `/unflip` `/roll` `/topic` `/remind` `/schedule`. → [specs/slash-commands.md](specs/slash-commands.md)

**Friends & DMs** — friends system, blocked users, 1:1 + group DMs, group-DM participant management, DM calls. → [specs/friends.md](specs/friends.md), [specs/direct-messages.md](specs/direct-messages.md)

**Mentions & notifications** — `@here`, `@everyone`, role mentions (`@RoleName`), mention highlighting, per-room notification preference, friend-request push notifications. → [specs/push-notifications.md](specs/push-notifications.md)

**Presence & profiles** — Online/Idle/DND/Offline status, custom status message, user profile card, profile editing (biography + avatar SAS upload), room profile image. → [specs/user-profile.md](specs/user-profile.md)

**Rooms** — categories with drag-reorder, read-only/announcement channels, slowmode, per-room nicknames, room welcome screen, system messages for join/leave. → [specs/rbac.md](specs/rbac.md), [specs/nicknames.md](specs/nicknames.md)

**Moderation** — RBAC roles/permissions, force-mute, kick, ban/unban, timeout, warn, softban, word filter, audit log. → [specs/rbac.md](specs/rbac.md), [specs/moderation.md](specs/moderation.md)

**Calls** — persistent per-room drop-in audio, LiveKit migration, video, screenshare, call lobby (knock & admit), deafen, raise-hand, call-health indicator. → [specs/call.md](specs/call.md), [specs/screenshare.md](specs/screenshare.md), [reference/call-refactor.md](reference/call-refactor.md), [reference/call-session-migration.md](reference/call-session-migration.md)

**Integrations & infra** — inbound webhooks, offline message cache, scheduled-message backend (queue worker), Sent tab via Search index.

## Decisions

Do **not** re-propose these on a future roadmap without a new reason. Grep here first when adding roadmap items.

- **Won't do** → [out-of-scope/](out-of-scope) — edit history, read receipts / unread badges, starred messages, keyword notification rules, "currently playing" activity, collapsible embeds.
- **Deferred (revisit trigger inside each file)** → [deferred/](deferred) — cross-process event bridge, message retention, server-side transcoding, virus scanning, custom emoji, outbound webhooks, `/giphy`, per-channel permission overrides, stage mode.

## Reference

- [architecture.md](architecture.md) — key file map, data flows, DB tables (AI-assist reference).
- [reference/](reference) — completed design records kept for context (call refactor, call-session migration).
- [specs/](specs) — per-feature design specs (one cohesive feature each).
