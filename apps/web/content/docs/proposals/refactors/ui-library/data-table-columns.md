---
title: Data table columns
description: Proposal — columns a reader resizes by dragging their divider, a first column that stays while the rest scroll sideways, a comfortable or compact density, and a sheet's cells walked by the arrows as the grid pattern has them.
model: claude-opus-5-5
---

# Data Table Columns

`UiDataTable` draws every row and column on a divider, tints the row under the pointer and sorts, pages, groups and selects ([UI library](/docs/architecture/ui-library)). What it does not do yet is what a spreadsheet reader reaches for next: widening a column whose text is cut off, keeping a row's name in view while scrolling to its far columns, and fitting more rows on a screen. A sheet also walks its cells by its own key commands rather than as the grid pattern does.

## What works today

- The column dividers are drawn per cell, so a handle can sit on each one without a second line.
- `UiResizeHandle` is the window splitter, dragged or stepped by the arrows, already named after what it sizes.
- A sheet's selection, its keys while cells are selected, and its column commands are registered commands.

## What this adds

- **Resizable columns**: a `UiResizeHandle` on each header's end edge, the width a column model the call site keeps, so a sheet stores it in its settings and the resource list in the address.
- **A sticky first column**: `isFirstColumnSticky`, the column staying at the start with a shade along its edge once the rest scroll under it.
- **Density**: comfortable, today's padding, and compact, half of it, as a model a page may keep in the reader's settings.
- **A sheet as a grid**: `role="grid"` on a table given `isCellNavigable`, one tab stop on the active cell, the arrows, Home and End, Page Up and Page Down walking cells, Enter editing, and the sheet's own commands kept on top.

## Next steps

1. Column widths as a model with the handle in the header, tested for the separator's name and range per column.
2. The sticky first column and the density model, each a scoped rule on the table rather than a utility per cell.
3. The grid mode, ported from the sheet's cell commands, with the grid pattern's keyboard test.

## Key files

| File                                                   | Role after the change                                       |
| :----------------------------------------------------- | :---------------------------------------------------------- |
| `apps/web/app/components/Ui/DataTable.vue`             | Widths, a sticky first column, density and the grid mode    |
| `apps/web/app/components/Ui/ResizeHandle.vue`          | Each column's handle                                        |
| `apps/web/app/components/Resource/Sheet/Row/Table.vue` | The sheet on the grid mode, its widths kept in its settings |

## Sources

- [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) — cells walked by the arrows with one tab stop.
- [Excel and Google Sheets](https://www.google.com/sheets/about/) — a column widened by its divider, and the frozen first column.
