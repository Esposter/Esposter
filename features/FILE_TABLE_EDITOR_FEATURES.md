# File Table Editor — Feature Roadmap

## UX / Workflow

- [x] **Undo/redo** — history stack for row/column mutations (Ctrl+Z / Ctrl+Shift+Z)
- [x] **Row drag-and-drop** — drag rows to reorder them; recorded in undo/redo history
- [x] **Add row manually** — dialog form with per-column typed inputs (respects hidden columns)
- [x] **Add column manually** — dialog form with name, type selector, and vjsf for description/sourceName
- [x] **Bulk row selection + delete** — checkboxes in the data table and column table to select and delete multiple rows or columns at once; single undoable command with full undo/redo support
- [x] **Pagination config** — handled by v-data-table

## Data Quality & Cleaning

- [ ] **Null/empty value strategy** — per-column setting to replace empty cells with a default value, "N/A", or drop the row entirely
- [ ] **Duplicate row detection** — highlight/remove rows that are identical across all or selected columns
- [x] **Trim/normalize strings** — bulk operation to strip extra whitespace, normalize casing (lowercase, title case, UPPER) across string columns
- [x] **Find & replace** — global search and replace across all rows and columns; live per-character highlighting, prev/next occurrence navigation, replace current or replace all, full undo/redo support

## Column Enhancements

- [x] **Column reordering** — drag-and-drop to reorder columns (affects export order)
- [ ] **Computed/derived columns** — define a formula (e.g., `price * quantity`) that generates a read-only column
- [x] **Column visibility toggle** — hide columns from the data table view without deleting them
- [x] **Column descriptions/annotations** — a free-text notes field per column; shown as info-icon tooltip in column table, native tooltip on data table headers

## Data Import

- [x] **JSON file support** — new `DataSourceType.Json`, handles flat arrays of objects
- [ ] **Multi-sheet XLSX** — allow importing multiple sheets as separate data sources or merged
- [ ] **Paste from clipboard** — paste tabular data copied from Excel/Google Sheets directly
- [ ] **URL import** — fetch a remote CSV/JSON URL instead of uploading a file

## Filtering & Sorting

- [x] **Column sorting** — click column header to sort rows ascending/descending in the UI (without mutating the data) — handled by v-data-table
- [ ] **Row filtering** — per-column filter chips
- [ ] **Saved filter presets** — name and persist a set of active filters

## Statistics & Analysis

- [ ] **Per-column stats panel** — min/max/avg for number columns, unique value count, null count, value frequency histogram
- [ ] **Data preview chart** — quick bar/line chart visualization of numeric columns using the existing chart infrastructure
- [ ] **Outlier detection** — flag numeric values that are > N standard deviations from the mean

## Export Enhancements

- [ ] **Filtered export** — export only currently visible (filtered) rows
- [x] **Column subset export** — choose which columns to include in the export
- [x] **JSON export** — export as a JSON array
- [ ] **Copy to clipboard** — copy selected rows as tab-separated text
