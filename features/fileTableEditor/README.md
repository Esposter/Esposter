# File Table Editor

A CSV/JSON/XLSX table editor with inline editing, data cleaning, computed columns, statistics, and Excel-style clipboard. Local-first; no backend.

This README is the index. Detail lives in the linked specs.

## Now

- Mature feature — no active work, no roadmap. New ideas: check [out-of-scope/](out-of-scope) first.

## Shipped

- **Editing** — inline cell editing, add/edit/delete rows & columns, bulk select + delete, undo/redo, row drag-reorder, keyboard cell navigation, Excel-style range copy/paste → [specs/clipboard.md](specs/clipboard.md)
- **Columns** — reorder, visibility toggle, descriptions, type recast on change, format strings, configurable footer aggregate; computed columns (Math via mathjs, StringPattern, String/Split, chained) and aggregation columns (sum/avg/count/min/max/rank/percent-of-total/running-sum) → [specs/computed-columns/overview.md](specs/computed-columns/overview.md)
- **Data quality** — null/empty strategy, duplicate-row detection, trim/normalize strings, global find & replace.
- **Import** — CSV/TSV/JSON, import preview (first 5 rows), paste tabular data from Excel/Sheets.
- **Export** — filtered rows, column subset, JSON array, selected-rows, copy-to-clipboard (TSV).
- **Filtering & sorting** — column sort, multi-column sort, per-column filters, global search, frozen row-number column.
- **Statistics & viz** — per-column stats (incl. string/date: top value, null %), data summary footer row, outlier detection (>2σ), numeric/boolean charts, string top-10 + date monthly charts, computed-column stats.

## Decisions

Do not re-propose without a new reason — [out-of-scope/](out-of-scope): URL import, multi-sheet XLSX, markdown export, saved filter presets, fill down, regex find & replace, row grouping, conditional formatting, cell validation rules, named checkpoints, row description, column freeze/pin.

## Reference

- [specs/](specs) — clipboard, computed-columns.
