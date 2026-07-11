---
title: Copy computed values
description: Proposal — range copy materializes computed-column values instead of yielding empty cells.
---

# Copy Computed Values

Make Excel-style range copy include computed-column values. Today `useCopyRangeToClipboard` slices stored `row.data` directly, so a computed column copies as empty cells — surprising against the Excel expectation that copying a formula cell yields its value, and the documented workaround (the export dialog) is a heavyweight detour for a quick copy.

## Scope

**Today:** copy writes TSV + HTML from `row.data[column.name]`; computed columns store nothing there, so their cells serialize empty. Export already solves materialization — `filterDataSourceColumns` resolves computed values into plain row data before the serializers run.

**This adds:** the same materialization on the copy path. No new UI, no new setting — copy simply behaves like export.

## How it works

In `useCopyRangeToClipboard`, resolve each cell through `computeValue(rows, row, columns, column)` (the one resolver every read site already uses — headers, cell render, export) instead of reading `row.data` directly when building the sub-DataSource handed to `copyToClipboard`. Non-computed columns are unaffected (`computeValue` returns `row.data[column.name]` for them), so the only behavioural change is computed cells carrying their displayed value. Alternatively reuse `filterDataSourceColumns` on the sliced range if the shapes line up — prefer whichever keeps one materialization code path.

Paste needs no change: computed columns are read-only and every write site already skips them, so pasting over a computed cell stays a no-op; the copied value simply lands wherever the user pastes it (another column, Excel, Sheets) — exactly the Excel semantics.

## Key files

Paths relative to `packages/app/app`.

| File                                                           | Change                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| `composables/resource/file/useCopyRangeToClipboard.ts`         | materialize cell values via `computeValue` when slicing |
| `services/resource/file/dataSource/filterDataSourceColumns.ts` | reuse if the shared materialization path fits           |

Update the [clipboard](/docs/file-table-editor/clipboard) and [computed columns](/docs/file-table-editor/computed-columns) Notes (both currently document the empty-cell behaviour) when this ships.

## Notes

- Copy is a hot interactive path but ranges are small (a visible selection), and `computeValue` is already evaluated per cell on render — materializing the same cells once more on Ctrl+C is negligible.
- A chained/cyclic computed column resolves exactly as it renders (`null` → empty cell), so copy can never be worse than what the grid shows.
