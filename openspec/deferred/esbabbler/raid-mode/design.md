# Raid Mode

A room lockdown switch: temporarily block new joins (or hold them in a verification queue) and rate-limit posting by recent joiners — Discord's anti-raid tooling.

**Why deferred**

- Raids are a scale problem; rooms are small and invite-gated today, and [invite expiry](../../../specs/esbabbler/invites/design.md) already shrinks the attack surface.
- Meaningful raid handling needs join-rate telemetry to trigger on, which doesn't exist yet.

**Cheaper interim:** slowmode, the word filter with [automod actions](../../../specs/esbabbler/automod-actions/design.md), bans, and invite deletion cover manual response.

**Revisit when:** a real raid happens, or rooms become publicly discoverable (see [room discovery](../room-discovery/design.md)).
