---
title: Decisions
description: Ideas rejected for the file table editor — do not re-propose without a new reason.
---

# Decisions

## URL import

**Rejected** — fetching a remote CSV/JSON URL instead of uploading a file. SSRF risk and CORS complexity, unreliable external data, and low product value for a casual platform where users have local files.

## Multi-sheet XLSX

**Rejected** — importing and merging multiple sheets from one XLSX workbook. Single-sheet import is sufficient (`sheetIndex` is already configurable on the XLSX data source item); multi-sheet merging adds complexity with low value.

## Markdown export

**Rejected** — exposing the existing `serializeToMarkdown.ts` as an official export format. Markdown is not a standard data-interchange format, and copy-to-clipboard already covers the shareability use case.

## Saved filter presets

**Rejected** — naming and persisting a set of active filters for reuse. Niche power-user feature with low mainstream appeal; most users reset filters when done.

## Fill down

**Rejected** — filling empty cells downward from the last non-empty value. The only real use case is cleaning merged cells exported from Excel, which is rare in practice; the null strategy already covers the general "fill empty cells" problem.

## Regex find & replace

**Rejected** — regular-expression find and replace across cells. The existing exact-match find & replace covers all practical use cases.

## Row grouping

**Rejected** — grouping rows by a column value (Excel-style outline grouping). Pushes toward Excel territory; out of scope for the platform's casual nature.

## Conditional formatting

**Rejected** — highlighting cells based on value conditions. Pushes toward Excel territory; out of scope for the platform's casual nature.

## Cell validation rules

**Rejected** — per-column validation such as "must be positive". Pushes toward Excel territory; out of scope for the platform's casual nature.

## Named checkpoints

**Rejected** — named snapshots in the history stack with a restore menu. Undo/redo already lets you traverse back to any prior state; checkpoints add UI complexity for marginal benefit over repeated Ctrl+Z.

## Row description

**Rejected** — a per-row free-text note (icon in the action slot, popover to edit). Not worth the complexity — the Column tab already surfaces column descriptions, and row-level notes are rarely useful for tabular data.

## Column freeze / pin

**Rejected** — freezing/pinning arbitrary columns so they stay visible while scrolling. Vuetify's data table supports sticky header/footer rows but not native per-column pinning; per-column freeze would require hand-rolled `position: sticky` CSS that does not exist in the editor today — not worth the complexity for a casual platform.
