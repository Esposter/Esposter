---
title: Search index capacity
description: Deferred — moving Azure AI Search off the Free SKU when the messages index outgrows its ceiling.
---

# Search Index Capacity

Azure AI Search is **already provisioned and in production** on the Free SKU (`prod-srch-esposter-001`, with a dev twin), serving esbabbler message search and the Sent tab through the single `messages-index` — see [Azure services](/docs/architecture/azure-services). The deferred item is not the service; it is paying for capacity once the Free SKU's ceiling is reached.

The Free SKU allows **3 indexes, 3 indexers, 3 data sources, 10,000 documents per index, and 50 MB of storage in total**, on one shared partition with no SLA. Today one index and one indexer are in use, so two slots are spare and the storage cap is the binding constraint — message documents carry the body text, attachment filenames, and sender name, so index growth tracks message volume directly.

## What happens at the ceiling

Nothing in the app breaks loudly. The `messages-indexer` is a scheduled pull indexer, so when it can no longer write documents its runs start failing while every already-indexed document stays queryable: **search keeps working and silently stops including new messages.** The failure is visible only in the indexer's status endpoint (`GET /indexers/messages-indexer/status`), which is exactly the surface [Observability](/docs/infra/observability) does not alert on. Assume the first symptom is a user reporting that a recent message can't be found.

## Why deferred

- Message volume is nowhere near the storage cap, and the two spare index slots absorb the next indexing idea without any change.
- The tier of an Azure AI Search service **cannot be changed after creation** — there is no Free → Basic upgrade. Moving up means standing up a second service, re-creating the index and indexer from `packages/infra/data/searchIndexes/messages-index.json`, letting it backfill, and repointing the app. That is a real migration, not a SKU edit, and it is not worth rehearsing before the numbers demand it.
- Basic is the first paid tier and costs tens of dollars a month — an order of magnitude above every other line item in this estate, whose whole posture is the `$0.01` budget guard.

## Revisit when

The indexer's status endpoint reports a quota or storage failure, index storage passes roughly half the 50 MB cap, or a second feature needs an index and would take the last free slot (the pending candidate is [resource search](/docs/platform/deferred/azure-ai-search)).

## Cheaper interim

Bounding the corpus buys capacity before spend does: [message retention](/docs/esbabbler/deferred/message-retention) pruning old rows shrinks what the indexer feeds, and keeping resource search on `pg_trgm` ([global search relevance](/docs/platform/global-search-relevance)) leaves the two spare index slots unspent.
