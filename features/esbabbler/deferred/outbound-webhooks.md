# Outbound Webhooks

Register HTTP endpoints per room; on configurable events (new message, pin, etc.) enqueue to Azure Service Bus and have an Azure Function POST with retry/backoff.

## Why deferred

- Developer/power-user feature; low ROI for a casual social platform.
- Posting to user-supplied URLs is an SSRF/abuse surface (same risk family as remote URL fetches).

## What already exists

The "needs infrastructure" blocker is gone — the building blocks are in code:

- Generic Service Bus queue + retry pattern (`useServiceBusSender`, `enqueueScheduledMessageJob`, `app.serviceBusQueue` trigger).
- `RoomPermission.ManageWebhooks` gate and the inbound webhook model (`webhooksInMessage`, `appUsersInMessage`, tokens).

## Revisit when

There is clear integration/automation demand. Remaining work is an outbound config (URL + event subscriptions), an emit→enqueue hook, a POST-with-retry queue function, and an SSRF/abuse review of the destination URLs — not new infrastructure.
