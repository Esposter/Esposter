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

`useCopyRangeToClipboard` slices `displayColumns` and `filteredRows` by the range bounds inline, then passes the result directly to `copyToClipboard(rangeDataSource, options)`.

---

## Paste

**Keyboard**: `Ctrl+V` / `Cmd+V` (overwrite) · `Ctrl+Shift+V` / `Cmd+Shift+V` (shift down)

The `PasteMode` enum (`models/tableEditor/file/commands/PasteMode.ts`) drives which mode runs:

| Value                 | Trigger        | Behaviour                                                     |
| --------------------- | -------------- | ------------------------------------------------------------- |
| `PasteMode.Overwrite` | `Ctrl+V`       | Overwrites existing cells in-place; appends rows past the end |
| `PasteMode.ShiftDown` | `Ctrl+Shift+V` | Inserts new rows at anchor, shifting existing rows down       |

`usePasteRangeFromClipboard` accepts `pasteMode = PasteMode.Overwrite`.

### Overwrite mode

- Reads TSV from clipboard (position-based, no header row expected)
- Anchor = top-left of current selection, or appends at end if no selection
- Fills cells left-to-right, top-to-bottom starting at anchor
- Columns beyond the last display column are silently ignored
- If pasted data extends past the last row, new rows are appended
- Values are coerced to the target column's type via `coerceValue`
- Columns pre-indexed via `Map<name, Column>` to avoid repeated linear scans

#### Undo/Redo

`PasteRangeCommand` extends `ADataSourceCommand<CommandType.PasteRange>`:

- Constructor captures `anchorRowIndex`, `anchorColumnIndex`, raw `pastedValues: string[][]`, `targetColumnNames: string[]`, and `originalRows: Row[]` (deep-cloned snapshot of affected rows)
- `doExecute`: overwrites cells; appends rows where needed; tracks `column.size` delta
- `doUndo`: removes appended rows (count = `pastedValues.length - originalRows.length`); restores original cell values and sizes

### Shift down mode

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
| `models/tableEditor/file/commands/PasteMode.ts`                        | `PasteMode` enum (`Overwrite` / `ShiftDown`)                 |
| `models/tableEditor/file/commands/PasteRangeCommand.ts`                | Overwrite paste + undo                                       |
| `services/tableEditor/file/commands/parseClipboardValuesByPosition.ts` | TSV → `string[][]` (no header row)                           |
| `composables/tableEditor/file/useCopyRangeToClipboard.ts`              | Slices range and writes to clipboard                         |
| `composables/tableEditor/file/commands/usePasteRangeFromClipboard.ts`  | Wires clipboard → `PasteRangeCommand` or `CreateRowsCommand` |
| `components/TableEditor/File/Row/Table.vue`                            | Keyboard event handlers; maps `shiftKey` → `PasteMode`       |
| `store/tableEditor/file/cell.ts`                                       | `shiftStartCellSelection`, `focusCell` for keyboard nav      |

---

## Tests

- `parseClipboardValuesByPosition.test.ts` — pure function: tab/newline splitting, CRLF, empty-line filtering
- `usePasteRangeFromClipboard.test.ts` — overwrite mode, shift down mode, undo/redo, column offset, type coercion, no-op cases
