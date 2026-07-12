---
title: Roadmap
description: Open esbabbler work, prioritized — every item links its proposal spec.
---

# Esbabbler — Roadmap

Prioritized top-down. Every item links a full proposal; the specs are the plan, this is the index. Grep [deferred](/docs/esbabbler/deferred) + [rejected](/docs/esbabbler/rejected) before adding anything.

## Next — low-hanging fruit

Each extends something already shipped, no new infra.

- [ ] [Per-user call volume](/docs/proposals/esbabbler/per-user-call-volume) — per-participant slider, client-only
- [ ] [Invite expiry](/docs/proposals/esbabbler/invite-expiry) — expiring and max-use invite links

## Later — larger or multi-area

- [ ] [Thread follows](/docs/proposals/esbabbler/thread-follows) — follow + notify-on-reply + Threads drawer
- [ ] [Automod actions](/docs/proposals/esbabbler/automod-actions) — word filter reject/warn/timeout
- [ ] [Moderator notes](/docs/proposals/esbabbler/moderator-notes) — private per-member notes
- [ ] [Audit log filters](/docs/proposals/esbabbler/audit-log-filters) — filter by action/actor/target
- [ ] [Room UI polish](/docs/proposals/esbabbler/room-ui-polish) — density, resizable sidebars, member grouping, empty states, mobile
- [ ] [File & media enhancements](/docs/proposals/esbabbler/file-media-enhancements) — thumbnails, attachment limits, files filter

## Hygiene

- [ ] [Store subscription audit](/docs/proposals/esbabbler/store-subscription-audit) — one owner per state transition + idempotence tests
- [ ] [Search index tooling](/docs/proposals/esbabbler/search-index-tooling) — index schema docs + status/rebuild scripts
- [ ] Voice & Video two-party verification — the live-call audio path (mic gain, gating, noise modes) still needs real two-party call verification ([/docs/esbabbler/voice-video](/docs/esbabbler/voice-video))
