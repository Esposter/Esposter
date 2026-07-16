---
title: Event Grid dead-letter
description: Proposal — dead-letter storage target + replay process for failed event deliveries.
---

# Event Grid Dead-Letter

Today an Event Grid delivery that exhausts retries is silently dropped — a push notification or webhook event lost with no trace. Dead-lettering writes the failed event to a blob container instead.

## Scope

**Today:** Event Grid subscriptions (push notifications, friend requests, webhook delivery) have default retry policy and no dead-letter destination.

**This adds:**

1. A `deadletter` container in the existing storage account (no new resource cost — reuse, per the cheapest-viable rule).
2. `deadLetterDestination` on each Event Grid subscription in Pulumi, plus a tightened retry policy (e.g. 10 attempts / 1h TTL — failures should land in the container while still relevant).
3. **Replay**: a `packages/shared-node` script that lists dead-letter blobs, re-publishes each event via the existing publisher client, and archives the blob. Script-first, no UI (same posture as [search index tooling](/docs/proposals/esbabbler/search-index-tooling)).
4. A storage lifecycle rule expiring dead-letter blobs after 30 days.

## Key files

| File                                                   | Change                                 |
| :----------------------------------------------------- | :------------------------------------- |
| `packages/infra/src/azure/` (Event Grid subscriptions) | dead-letter destination + retry policy |
| `packages/shared-node/` (new script)                   | list/replay/archive                    |

## Notes

The at-least-once contract stands: replayed events can double-deliver; handlers are already idempotent-or-tolerant per the Azure Functions error-handling rules.
