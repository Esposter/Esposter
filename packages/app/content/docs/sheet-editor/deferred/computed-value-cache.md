---
title: Computed-value cache
description: Memoize computed-column evaluation instead of recomputing on every read.
---

# Computed-value cache

Cache computed-column cell values so sorting, searching, rendering, and export stop re-evaluating the same transformation per read.

**Why deferred:** Values are recomputed on every read by design — row data are plain objects with no dirty-tracking, so a correct cache needs an invalidation story spanning every mutation path (cell edits, row add/delete, paste, type recast, source-column changes, and dataset-wide aggregations that depend on _all_ rows). That is real machinery, and recomputation has been cheap enough in practice on the datasets the casual platform actually sees.

**Revisit when:** A profile on a realistic large dataset shows computed-column evaluation as a material cost of interaction (sort/search lag with aggregation or chained columns) — then key the memo per (row id, column id) and invalidate through the command layer, which already sees every mutation.
