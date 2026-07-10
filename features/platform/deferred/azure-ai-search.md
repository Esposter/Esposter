# Azure AI Search for resource search

Index `resources` (name, tags, eventually content extracts) into Azure AI Search for ranked, fuzzy, cross-field search.

## Why deferred

The only genuinely paid item in the portal-parity program. `ilike` with prefix ranking covers current volumes, and the `pg_trgm` migration ([specs/global-search.md](../specs/global-search.md) relevance ladder) buys typo tolerance for free before any service spend is justified.

## Revisit when

Search quality complaints survive `pg_trgm` (relevance, typo tolerance, cross-field matching over tags/content), or resource counts make Postgres `ilike` measurably slow.

## Cheaper interim

Prefix-match ranking (free) → `pg_trgm` similarity (Postgres extension, no service).
