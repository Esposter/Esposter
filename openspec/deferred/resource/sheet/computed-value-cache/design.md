# Computed-value cache

Cache computed-column cell values so sorting, searching, rendering, and export stop re-evaluating the same transformation per read.

A single pass over rows nothing edits mid-pass already walks each aggregation's column once rather than once per cell (`transformationReaderMap`, [computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); what stays deferred is a cache that outlives one pass.

**Why deferred:** Values are recomputed on every read by design ([computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); a correct cache needs an invalidation story spanning every mutation path (cell edits, row add/delete, paste, type recast, source-column changes, and dataset-wide aggregations that depend on _all_ rows). That is real machinery, and recomputation has been cheap enough in practice on the datasets the casual platform actually sees.

**Revisit when:** A profile on a realistic large dataset shows computed-column evaluation as a material cost of interaction (sort/search lag with aggregation or chained columns) — then key the memo per (row id, column id) and invalidate through the command layer, which already sees every mutation.
