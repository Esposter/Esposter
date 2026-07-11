---
title: Search index tooling
description: Proposal — document the messages Search index schema and add admin status/rebuild tooling.
---

# Search Index Ownership

The Azure AI Search messages index powers filtered search and the Sent tab, but its schema is undocumented and there is no way to see or repair index drift.

## Scope

**Today:** `searchMessages` / `readMySentMessages` query the index; indexing happens on write. If indexing ever fails silently, nothing surfaces it and nothing can rebuild it.

**This adds:**

1. **Schema documentation** — a `docs/architecture` subsection (or extension of [/docs/architecture/azure-services](/docs/architecture/azure-services)) describing the `messages-index` fields, analyzers, and which procedures read it.
2. **Index status surface** — an internal-only check comparing recent Table writes against index document counts per room (sampled), exposed as a dev/admin script in `packages/shared-node` or an owner-gated procedure — cheapest viable: a script, no UI.
3. **Rebuild tooling** — a script that re-feeds a room's (or all) messages from Azure Table into the index in `AZURE_MAX_PAGE_SIZE` batches, idempotent by document key.

## Key files

| File                                                              | Change                     |
| :---------------------------------------------------------------- | :------------------------- |
| `packages/app/server/composables/azure/search/useSearchClient.ts` | shared client              |
| `packages/shared-node/` (new script)                              | status + rebuild scripts   |
| `packages/app/content/docs/architecture/azure-services.md`        | index schema documentation |

## Notes

Deliberately script-first: an admin UI for a single-operator platform is over-engineering. If operators multiply, promote the scripts to owner-gated procedures then.
