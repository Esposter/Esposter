---
title: Raid mode
description: Deferred — lockdown switch throttling joins and new-member posting.
---

# Raid Mode

A room lockdown switch: temporarily block new joins (or hold them in a verification queue) and rate-limit posting by recent joiners — Discord's anti-raid tooling.

**Why deferred**

- Raids are a scale problem; rooms are small and invite-gated today, and [invite expiry](/docs/esbabbler/invites) already shrinks the attack surface.
- Meaningful raid handling needs join-rate telemetry to trigger on, which doesn't exist yet.

**Cheaper interim:** slowmode, the word filter with [automod actions](/docs/proposals/esbabbler/automod-actions), bans, and invite deletion cover manual response.

**Revisit when:** a real raid happens, or rooms become publicly discoverable (see [room discovery](/docs/esbabbler/deferred/room-discovery)).
