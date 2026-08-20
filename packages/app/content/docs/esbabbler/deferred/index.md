---
title: Deferred
description: Ideas we chose not to build yet, each with a revisit trigger.
---

# Deferred

One page per idea; each states why it waits and the concrete trigger to revisit.

- [Call state reconciliation](/docs/esbabbler/deferred/call-state-reconciliation) — rebuild the call maps after a restart; revisit when a call routinely spans a deploy
- [Cross-process event bridge](/docs/esbabbler/deferred/cross-process-event-bridge) — WebPubSub fan-out; revisit at multi-replica
- [Custom emoji](/docs/esbabbler/deferred/custom-emoji) — per-room emoji/sticker uploads; revisit on room-branding demand
- [Custom video backgrounds](/docs/esbabbler/deferred/custom-video-backgrounds) — user-uploaded call backgrounds; revisit with custom emoji
- [/giphy](/docs/esbabbler/deferred/giphy) — GIF search command; revisit when accepting the external API dependency
- [Message retention](/docs/esbabbler/deferred/message-retention) — per-room pruning; revisit when Table storage cost is material
- [Message translation](/docs/esbabbler/deferred/message-translation) — inline translate; revisit when the community is multilingual
- [Outbound webhooks](/docs/esbabbler/deferred/outbound-webhooks) — POST room events to endpoints; revisit on integration demand
- [Per-channel permission overrides](/docs/esbabbler/deferred/per-channel-permission-overrides) — revisit when sub-channels exist
- [Raid mode](/docs/esbabbler/deferred/raid-mode) — join lockdown; revisit on a real raid or public discovery
- [Room attachment quota](/docs/esbabbler/deferred/room-attachment-quota) — a room-scoped storage allowance; revisit when a room's attachments pass a gigabyte
- [Room discovery](/docs/esbabbler/deferred/room-discovery) — public room directory; revisit with the platform discover surface
- [Server-side transcoding](/docs/esbabbler/deferred/server-side-transcoding) — revisit at media-volume scale
- [Softban preview](/docs/esbabbler/deferred/softban-preview) — confirm-with-messages UX; revisit if softban misfires
- [Speaker volume boost](/docs/esbabbler/deferred/speaker-volume-boost) — >100% master volume; revisit if calls stay too quiet
- [Stage mode](/docs/esbabbler/deferred/stage-mode) — listener-by-default calls; revisit for presentation-style rooms
- [Virus scanning](/docs/esbabbler/deferred/virus-scanning) — revisit when uploads become an abuse risk
