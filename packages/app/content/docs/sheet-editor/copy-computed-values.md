---
title: Copy computed values
description: Excel-style range copy materializes computed-column values instead of yielding empty cells.
---

# Copy computed values

Range copy includes computed-column values, matching the Excel expectation that copying a formula cell yields its value.

## How it works

`useCopyRangeToClipboard` used to slice the selected columns and rows and hand the sub-DataSource straight to `copyToClipboard`, which serializes each cell from stored `row.data`. Computed columns store nothing there, so their cells serialized empty.

Copy now materializes through the same path export uses: `filterDataSourceColumns` resolves every selected cell through `computeValue` — the one resolver headers, cell render, and export all share — against the full row and column context, then the range is sliced down to the selection. Non-computed columns are unaffected (`computeValue` returns `row.data[column.name]` for them), so the only behavioural change is computed cells carrying their displayed value. There is one materialization code path, not a copy-specific fork.

Paste needs no change: computed columns are read-only and every write site already skips them, so pasting over a computed cell stays a no-op. The copied value simply lands wherever the user pastes it — another column, Excel, Sheets — exactly the Excel semantics.

```mermaid
flowchart LR
  R[Selected range] --> F[filterDataSourceColumns]
  F --> C[computeValue per cell]
  C --> S[Sliced sub-DataSource]
  S --> CB[copyToClipboard TSV and HTML]
```

## Key files

Paths relative to `packages/app/app`.

| File                                                            | Role                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| `composables/resource/sheet/useCopyRangeToClipboard.ts`         | Materializes the selection via `filterDataSourceColumns` |
| `services/resource/sheet/dataSource/filterDataSourceColumns.ts` | The shared resolver that materializes computed values    |
| `services/resource/sheet/column/computeValue.ts`                | Per-cell resolver used by render, export, and now copy   |

## Notes

- Copy is a hot interactive path, but a selection is small and `computeValue` is already evaluated per cell on render, so materializing the same cells once more on `Ctrl+C` is negligible.
- A chained or cyclic computed column resolves exactly as it renders (`null` → empty cell), so copy can never be worse than what the grid shows.
