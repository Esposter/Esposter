# Cloudflare runtime

## Why

The app runs on Railway as one Node process, and its tRPC subscriptions, EventEmitters and call maps assume that process. It moves to a Worker, with that stateful half in Nitro's own Durable Object.

## What changes

The app builds with the `cloudflare_module` preset; `/api/trpc` and `/ws` run in the `server` Durable Object; Node-only calls are replaced where Workers lack them; client-only libraries leave the server bundle, and CI fails a server bundle past the Worker size cap. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
