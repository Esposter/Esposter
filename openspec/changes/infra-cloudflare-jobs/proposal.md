# Cloudflare jobs

## Why

Async work runs in Azure Functions behind Event Grid and Service Bus, and reaches the app's live subscriptions through Web PubSub. It moves to Queues, Durable Object alarms and the app's own Durable Object.

## What changes

`apps/functions` is a Worker consuming one Queue per job and a Cron Trigger; a Scheduler object replaces Service Bus delays; consumers publish to live subscriptions through the `server` object; Web PubSub and the dead-letter replay are deleted. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
