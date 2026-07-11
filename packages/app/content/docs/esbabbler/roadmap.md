---
title: Roadmap
description: Open esbabbler work, prioritized — every item links its proposal spec.
---

# Esbabbler — Roadmap

Prioritized top-down. Every item links a full proposal; the specs are the plan, this is the index. Grep [deferred](/docs/esbabbler/deferred) + [rejected](/docs/esbabbler/rejected) before adding anything.

## Next — low-hanging fruit

Each extends something already shipped, no new infra.

- [ ] [Mention badges](/docs/proposals/esbabbler/mention-badges) — mention-only unread counts in the sidebar
- [ ] [Push-to-talk release delay](/docs/proposals/esbabbler/push-to-talk-release-delay) — grace period before the gate closes

## Later — larger or multi-area

- [ ] [Room settings alignment](/docs/proposals/esbabbler/room-settings-alignment) — Discord Server Settings IA/naming parity
- [ ] [Thread follows](/docs/proposals/esbabbler/thread-follows) — follow + notify-on-reply + Threads drawer
- [ ] [Automod actions](/docs/proposals/esbabbler/automod-actions) — word filter reject/warn/timeout
- [ ] [Moderator notes](/docs/proposals/esbabbler/moderator-notes) — private per-member notes
- [ ] [Room UI polish](/docs/proposals/esbabbler/room-ui-polish) — density, resizable sidebars, member grouping, empty states, mobile
- [ ] [File & media enhancements](/docs/proposals/esbabbler/file-media-enhancements) — thumbnails, attachment limits, files filter

## Hygiene

- [ ] [Optimistic mutations sweep](/docs/proposals/esbabbler/optimistic-mutations) — every user-facing mutation through `useOptimisticMutation`
- [ ] [Store subscription audit](/docs/proposals/esbabbler/store-subscription-audit) — one owner per state transition + idempotence tests
- [ ] [Search index tooling](/docs/proposals/esbabbler/search-index-tooling) — index schema docs + status/rebuild scripts
- [ ] Voice & Video two-party verification — the live-call audio path (mic gain, gating, noise modes) still needs real two-party call verification ([/docs/esbabbler/voice-video](/docs/esbabbler/voice-video))
