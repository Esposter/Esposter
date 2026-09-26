# Counting

Read when a surface shows how many rows a table holds for a filter.

Azure Table has no count API — `readEntitiesCount` (from `@esposter/db`) walks every matching page with a keys-only projection. Two rules keep the walk cheap and honest:

- **Only count when a capped read filled.** A read under its cap answers for itself (`rows.length < cap ? rows.length : await readFooEntitiesCount(...)`); only a full page has something to be missing.
- **Bound the walk when the count feeds a display.** Pass `readEntitiesCount`'s `maxCount` argument (callers name their own bound). A count that hit the bound is a floor, not a total — every surface must render it as one ("N+", via the shared truncation formatter), never as an exact number.
