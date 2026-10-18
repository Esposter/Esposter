# Computed-value cache

Cache computed-column cell values so sorting, searching, rendering, and export stop re-evaluating the same transformation per read.

Binding a sheet's computed columns once per row list already walks each aggregation's column once rather than once per cell (`compileSheetColumns`, [computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); what stays deferred is a cache that outlives one binding.

**Why deferred:** Values are not cached across binds by design ([computed columns](../../../../specs/resource/sheet/computed-columns/design.md)); a correct cache needs an invalidation story spanning every mutation path (cell edits, row add/delete, paste, type recast, source-column changes, and dataset-wide aggregations that depend on _all_ rows). That is real machinery, and recomputation has been cheap enough in practice on the datasets the casual platform actually sees.

**Revisit when:** A profile on a realistic large dataset shows computed-column evaluation as a material cost of interaction (sort/search lag with aggregation or chained columns) — then key the memo per (row id, column id) and invalidate through the command layer, which already sees every mutation.

A diamond is the shape that would make the cost exponential rather than linear: a column that reads one source twice, the next reading that column twice, and so on. Binding answers it: each column's reader is built once per row list and shared by every column that reads it ([computed columns](../../../../specs/resource/sheet/computed-columns/design.md)), so a chain of N columns costs N binds rather than 2^N reads per row. What a cache would still add is a memo that outlives one row list, which brings back the invalidation problem above; that is the decision to take before the profile fires, not after.
