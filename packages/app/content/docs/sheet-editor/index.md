---
title: Sheet Editor
description: The grid editor for CSV/JSON/XLSX Sheet resources — inline editing, data cleaning, computed columns, statistics, and Excel-style clipboard.
---

# Sheet Editor

The sheet editor is the grid editor of the **Sheet resource** — a spreadsheet-like editor for CSV, JSON, and XLSX files with inline editing, data cleaning, computed columns, statistics, and an Excel-style clipboard. It is surfaced as the Data blade of a Sheet resource in the Resource Explorer (`/resources/[id]/[[blade]]`).

## Key concepts

- **DataSource** — the in-memory model of the open file: a list of `Column` definitions plus `Row` objects whose `data` maps column name → value. Format-specific serializers (CSV, JSON, XLSX) convert between the file bytes and this one model, so every grid feature works identically for all three formats.
- **Columns are typed** — `ColumnType` is `String`, `Number`, `Boolean`, `Date`, or `Computed`. Types are inferred on import and drive cell coercion, per-column filters, statistics, and charts. Changing a column's type recasts its existing values.
- **Computed columns** — read-only columns whose value is derived lazily from other columns through a transformation (math expressions, string operations, type conversion, date parts, regex extraction, dataset aggregations). See [computed columns](/docs/sheet-editor/computed-columns).
- **Command history** — every mutation is a command object (`ADataSourceCommand`) pushed onto a history store, which is what powers unlimited undo/redo, including for multi-cell operations like range paste.
- **Cell selection** — an Excel-style anchor/focus range selection (click, drag, Shift+click, Shift+Arrow) that keyboard copy/paste operates on. See [clipboard](/docs/sheet-editor/clipboard).

The area is mature. Open work: [roadmap](/docs/sheet-editor/roadmap). New ideas should be checked against [deferred](/docs/sheet-editor/deferred) and [rejected](/docs/sheet-editor/rejected) first.

## Shipped

- **Editing** — inline cell editing, add/edit/delete rows and columns, bulk select + delete, undo/redo, row drag-reorder, keyboard cell navigation, Excel-style range copy/paste ([clipboard](/docs/sheet-editor/clipboard)).
- **Columns** — reorder, visibility toggle, descriptions, type recast on change, format options (number/boolean/date), configurable footer aggregate; computed columns (Math via mathjs, ConvertTo, DatePart, RegexMatch, String, StringSplit, StringPattern, chained) and aggregation columns (average/count/min/max/rank/percent-of-total/running-sum) ([computed columns](/docs/sheet-editor/computed-columns)).
- **Data quality** — null/empty strategy, duplicate-row detection, trim/normalize strings, global find & replace.
- **Import** — CSV/TSV/JSON/XLSX, import preview, paste tabular data from Excel/Sheets.
- **Export** — filtered rows, column subset, JSON array, selected-rows, copy-to-clipboard (TSV).
- **Filtering & sorting** — column sort, multi-column sort, per-column filters, global search, frozen row-number column.
- **Statistics & viz** — per-column stats (including string/date: top value, null %), data summary footer row, outlier detection (>2σ), numeric/boolean charts, string top-10 and date monthly charts, computed-column stats.
