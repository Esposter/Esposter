# File Table Editor — Clipboard Feature Spec

## Overview

Keyboard-driven copy/paste for cell ranges, aligned with Excel selection UX. All paste operations are reversible via undo/redo.

---

## Copy

**Keyboard**: `Ctrl+C` / `Cmd+C`

- Requires an active cell selection (drag, click, or Shift+click/arrow)
- Copies only visible (non-hidden) columns within the range
- Header row included/excluded based on the `copyIncludesHeaders` toggle (the eye button in the toolbar)
- Writes both `text/plain` (TSV) and `text/html` (styled table) to clipboard via `ClipboardItem`; falls back to `writeText` when `ClipboardItem` is unavailable (e.g. Firefox)

### Implementation

`CopyRangeCommand` (model, not extending `ADataSourceCommand` — read-only, no undo needed):

- Constructor: `(range: CellRange, displayColumns: Column[], rows: Row[], includeHeaders: boolean)`
- `execute()` → `CopiedRange { columns, rows, includeHeaders }` (sliced by range bounds)

`useCopyRangeToClipboard` composable wires `CopyRangeCommand.execute()` to `copyToClipboard(rangeDataSource, options)`.

---

## Paste — Overwrite mode (default)

**Keyboard**: `Ctrl+V` / `Cmd+V`

- Reads TSV from clipboard (position-based, no header row expected)
- Anchor = top-left of current selection, or appends at end if no selection
- Fills cells left-to-right, top-to-bottom starting at anchor
- Columns beyond the last display column are silently ignored
- If pasted data extends past the last row, new rows are appended
- Values are coerced to the target column's type via `coerceValue`

### Undo/Redo

`PasteRangeCommand` extends `ADataSourceCommand<CommandType.PasteRange>`:

- Constructor captures `anchorRowIndex`, `anchorColumnIndex`, raw `pastedValues: string[][]`, `targetColumnNames: string[]`, and `originalRows: Row[]` (deep-cloned snapshot of affected rows)
- `doExecute`: overwrites cells; appends rows where needed; tracks `column.size` delta
- `doUndo`: removes appended rows (count = `pastedValues.length - originalRows.length`); restores original cell values and sizes

---

## Paste — Insert mode (push down)

**Keyboard**: `Ctrl+Shift+V` / `Cmd+Shift+V`

- Reads TSV from clipboard (position-based)
- Inserts parsed rows at anchor row index, shifting existing rows down
- Uses `CreateRowsCommand` with `startIndex = anchorRowIndex` (undo removes inserted rows)
- Each row's cells are filled by display-column position from `anchorColumnIndex`

---

## Selection UX (prerequisite for range copy/paste)

| Gesture     | Behavior                                     |
| ----------- | -------------------------------------------- |
| Click cell  | Start single-cell selection                  |
| Shift+click | Extend selection from anchor to clicked cell |
| Drag        | Extend selection while mouse held            |
| Arrow keys  | Move selection (collapses to single cell)    |
| Shift+Arrow | Extend selection in arrow direction          |
| Ctrl/Cmd+A  | Select all cells                             |
| Escape      | Clear selection                              |

Anchor is preserved across Shift+click and Shift+Arrow; drag re-anchors on mousedown.

---

## Removed UI

- `CopyToClipboardButton` removed from `TextSlot.vue` (still present in `TopSlot.vue` for row-level copy of checkbox-selected rows)
- `PasteFromClipboardButton` removed from `TextSlot.vue` (replaced by `Ctrl+V`)
- `CopyIncludesHeadersButton` retained in `TextSlot.vue` (controls `Ctrl+C` header behaviour)

---

## Key Files

| File                                                                   | Role                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `models/tableEditor/file/CellRange.ts`                                 | `CellRange` interface                                        |
| `models/tableEditor/file/commands/CopyRangeCommand.ts`                 | Range extraction + `CopiedRange` return type                 |
| `models/tableEditor/file/commands/PasteRangeCommand.ts`                | Overwrite paste + undo                                       |
| `services/tableEditor/file/commands/parseClipboardValuesByPosition.ts` | TSV → `string[][]` (no header row)                           |
| `composables/tableEditor/file/useCopyRangeToClipboard.ts`              | Wires `CopyRangeCommand` → clipboard                         |
| `composables/tableEditor/file/commands/usePasteRangeFromClipboard.ts`  | Wires clipboard → `PasteRangeCommand` or `CreateRowsCommand` |
| `components/TableEditor/File/Row/Table.vue`                            | Keyboard event handlers                                      |
| `store/tableEditor/file/cell.ts`                                       | `shiftStartCellSelection`, `focusCell` for keyboard nav      |

---

## Tests

- `parseClipboardValuesByPosition.test.ts` — pure function: tab/newline splitting, CRLF, empty-line filtering
- `CopyRangeCommand.test.ts` — range slicing for columns and rows, `includeHeaders` passthrough
- `PasteRangeCommand.test.ts` — overwrite, append, undo/redo, column offset, type coercion, size tracking
