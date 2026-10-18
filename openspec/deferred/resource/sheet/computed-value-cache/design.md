# Computed-value cache

Cache computed-column cell values so sorting, searching, rendering, and export stop re-evaluating the same transformation per read.

A single pass over rows nothing edits mid-pass already walks each aggregation's column once rather than once per cell (`transformationReaderMap`, [computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); what stays deferred is a cache that outlives one pass.

**Why deferred:** Values are recomputed on every read by design ([computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); a correct cache needs an invalidation story spanning every mutation path (cell edits, row add/delete, paste, type recast, source-column changes, and dataset-wide aggregations that depend on _all_ rows). That is real machinery, and recomputation has been cheap enough in practice on the datasets the casual platform actually sees.

**Revisit when:** A profile on a realistic large dataset shows computed-column evaluation as a material cost of interaction (sort/search lag with aggregation or chained columns) — then key the memo per (row id, column id) and invalidate through the command layer, which already sees every mutation.

A diamond is the shape that makes the cost exponential rather than linear: a column that reads one source twice, the next reading that column twice, and so on, costs about 2^N resolver calls per row, because `computeValue` recomputes a shared source once per path (the diamond case after the cycle guard, [computed columns](../../../../specs/resource/sheet/computed-columns/design.md)). A memo scoped to one cell's read, keyed by column id, bounds it to N and needs no invalidation, since nothing writes during a read; it changes the "computed once per source" line of that spec, so it is the decision to take before the profile fires, not after.
