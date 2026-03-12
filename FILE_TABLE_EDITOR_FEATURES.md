# File Table Editor — Feature Roadmap

## UX / Workflow

- [x] **Undo/redo** — history stack for row/column mutations (Ctrl+Z / Ctrl+Shift+Z)
- [ ] **Add row manually** — form to insert a new blank row with typed fields
- [ ] **Add column manually** — create a new column with a default value for all rows
- [ ] **Bulk row selection + delete** — checkboxes in the data table to delete multiple rows at once
- [x] **Pagination config** — handled by v-data-table

## Data Quality & Cleaning

- [ ] **Null/empty value strategy** — per-column setting to replace empty cells with a default value, "N/A", or drop the row entirely
- [ ] **Duplicate row detection** — highlight/remove rows that are identical across all or selected columns
- [ ] **Trim/normalize strings** — bulk operation to strip extra whitespace, normalize casing (lowercase, title case, UPPER) across string columns
- [ ] **Find & replace** — search for a value across all rows in a column and replace it

## Column Enhancements

- [ ] **Column reordering** — drag-and-drop to reorder columns (affects export order)
- [ ] **Computed/derived columns** — define a formula (e.g., `price * quantity`) that generates a read-only column
- [ ] **Column visibility toggle** — hide columns from the data table view without deleting them
- [ ] **Column descriptions/annotations** — a free-text notes field per column

## Data Import

- [x] **JSON file support** — new `DataSourceType.Json`, handles flat arrays of objects
- [ ] **Multi-sheet XLSX** — allow importing multiple sheets as separate data sources or merged
- [ ] **Paste from clipboard** — paste tabular data copied from Excel/Google Sheets directly
- [ ] **URL import** — fetch a remote CSV/JSON URL instead of uploading a file

## Filtering & Sorting

- [ ] **Column sorting** — click column header to sort rows ascending/descending in the UI (without mutating the data)
- [ ] **Row filtering** — per-column filter chips (string contains, number range, boolean, date range)
- [ ] **Saved filter presets** — name and persist a set of active filters

## Statistics & Analysis

- [ ] **Per-column stats panel** — min/max/avg for number columns, unique value count, null count, value frequency histogram
- [ ] **Data preview chart** — quick bar/line chart visualization of numeric columns using the existing chart infrastructure
- [ ] **Outlier detection** — flag numeric values that are > N standard deviations from the mean

## Export Enhancements

- [ ] **Filtered export** — export only currently visible (filtered) rows
- [ ] **Column subset export** — choose which columns to include in the export
- [x] **JSON export** — export as a JSON array
- [ ] **Copy to clipboard** — copy selected rows as tab-separated text
