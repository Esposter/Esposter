---
title: Cross-process event bridge
description: Deferred — mirror real-time events to Azure Web PubSub for multi-replica fan-out.
---

# Cross-Process Event Bridge

Mirror real-time events (message/room/role/user-to-room/call state) to Azure Web PubSub for cross-process fan-out, with a `receiveWebPubSubEvent` dispatcher re-emitting them into the local EventEmitter and idempotency keys to prevent double-apply.

**Why deferred**

- The app runs a single Node process today; the in-process EventEmitter is correct and sufficient.
- The plumbing (publish boundary + WebPubSub mirror + dispatcher + per-event idempotency/dedup) is real distributed-systems work that is easy to get subtly wrong.
- It is speculative: it builds fan-out for a scaling event that may never happen.

**Revisit when:** the app actually runs more than one replica (or needs cross-process delivery for another concrete reason). Going multi-replica is a deliberate decision — build this at that moment, not before.
