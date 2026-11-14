# Cloudflare live queries

## Why

A page shows what was true when it loaded. Someone else's edit, like, comment, rename or new post reaches a reader only when they refresh, except on the few paths that push events by hand. The read side of the app is request and response; it should be a subscription, as it is in SpacetimeDB, Convex and Zero, so that whatever is on screen is the current state without the reader doing anything.

## What changes

Every query becomes live. A query names the topics its result depends on; a mutation names the topics it changed; when a mutation commits, every viewer currently showing a query on one of those topics has it refetched. Messages, typing and calls keep pushing data directly, because they are the hot paths and already do. Everything else gets liveness from one mechanism instead of a hand-written event per feature. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md), built on the [realtime objects](../infra-cloudflare-realtime/design.md); the mechanics are in [design](design.md).
