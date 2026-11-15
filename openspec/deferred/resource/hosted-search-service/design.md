# Hosted search service for resource search

Index `resources` (name, tags, eventually content extracts) into a hosted search service for ranked, fuzzy, cross-field search.

## Why deferred

The reason to wait is that nothing needs it. Resource search is one FTS5 table in D1 over each resource's name and tags, ranked by bm25 with the name weighted over a tag, and its last word matches as a prefix ([global search relevance](../../../specs/resource/global-search-relevance/design.md)). Triggers on the resource table write its row with the resource, so the index needs no indexer to run. That is the cheap part of what a search service would buy, and it needs no service to provision either.

## Revisit when

Search quality complaints survive the FTS5 table (relevance, typo tolerance, matching over content), or resource counts make the D1 match measurably slow.

## Cheaper interim

The FTS5 table already built, whose prefix match and bm25 ranking cost nothing more. Changing how it tokenizes is a rebuild of the table, not a new service.
