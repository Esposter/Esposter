---
title: Azure AI Search for resource search
description: Deferred — indexing resources into Azure AI Search for ranked, fuzzy, cross-field search.
---

# Azure AI Search for resource search

Index `resources` (name, tags, eventually content extracts) into Azure AI Search for ranked, fuzzy, cross-field search.

## Why deferred

Not for want of a search service — one is already running. Azure AI Search is provisioned on the Free SKU and already carries the esbabbler messages index, so a resources index is an additional index on infrastructure that exists, not new service spend. What it does cost is a slot: the Free SKU allows three indexes, and a resources index takes one of them ([search index capacity](/docs/infra/deferred/search-index-capacity)).

The reason to wait is that nothing needs it. Postgres covers current volumes, and [`pg_trgm` relevance](/docs/platform/global-search-relevance) already bought typo tolerance for free — the cheap 80% of what a search index would buy, without spending a slot or adding a second indexer to operate.

## Revisit when

Search quality complaints survive `pg_trgm` (relevance, typo tolerance, cross-field matching over tags/content), or resource counts make Postgres `ilike` measurably slow.

## Cheaper interim

Prefix-match ranking (free) → `pg_trgm` similarity (Postgres extension, no service).
