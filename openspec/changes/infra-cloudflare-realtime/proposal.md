# Cloudflare realtime

## Why

The program first ran the whole Nitro app inside one Durable Object so the in-process EventEmitters kept working. That object is one thread in one location for every socket in the app, it cannot hibernate, and every subscription filters every event in memory. Cloudflare's own model for this is one object per thing that has live state — a room, a call, a user — each with its own storage and its own sockets.

## What changes

The web Worker becomes stateless. A Room object owns each room's messages, reactions and search in its own SQLite and the sockets of the people viewing it; a Call object owns each call's participants and knockers; a User object owns each person's sockets and personal events. Live updates are typed events pushed over hibernating WebSockets instead of tRPC subscriptions, and scheduled work is an alarm on the object that owns it. Message ids become each room's own integer sequence and every D1 id becomes a UUIDv7. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
