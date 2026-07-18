---
title: Azure AI Search for resource search
description: Deferred — indexing resources into Azure AI Search for ranked, fuzzy, cross-field search.
---

# Azure AI Search for resource search

Index `resources` (name, tags, eventually content extracts) into Azure AI Search for ranked, fuzzy, cross-field search.

## Why deferred

The only genuinely paid item in the portal-parity program. Postgres covers current volumes, and [`pg_trgm` relevance](/docs/platform/global-search-relevance) already bought typo tolerance for free — the cheap 80% of what a search service would buy, at no service spend.

## Revisit when

Search quality complaints survive `pg_trgm` (relevance, typo tolerance, cross-field matching over tags/content), or resource counts make Postgres `ilike` measurably slow.

## Cheaper interim

Prefix-match ranking (free) → `pg_trgm` similarity (Postgres extension, no service).
