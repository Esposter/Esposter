---
title: Global Search Relevance
description: pg_trgm typo tolerance for resource name search — extension + GIN index migration, similarity() ranking.
---

# Global Search Relevance (`pg_trgm`)

Typo tolerance for [global search](/docs/platform/global-search) at zero service cost.

## Scope

**Today**: `readResources` ranks prefix matches first, then substring matches, newest-first within each tier — exact-substring only, so a typo ("survye") finds nothing. **This proposal adds**: the `pg_trgm` Postgres extension + a GIN trigram index on `resources.name`, and `similarity()` ranking so near-matches surface.

## Plan

1. One migration: `CREATE EXTENSION IF NOT EXISTS pg_trgm;` + `CREATE INDEX ... USING gin (name gin_trgm_ops);` (never run `db:gen`/`db:up` automatically — generate on request, user applies).
2. `readResources`: when a `searchQuery` is set, add a `similarity(name, query) > threshold` OR-arm to `createResourcesWhere` and rank by `similarity()` before the existing prefix/updatedAt tiers.
3. Keep `createResourcesWhere` the single filter source so `count` stays in lockstep.

## Notes

- Azure AI Search stays [deferred](/docs/platform/deferred/azure-ai-search) — nothing at current volumes needs it.
