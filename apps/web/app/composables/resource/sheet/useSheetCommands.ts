import type { UiCommand } from "#src/models/ui/UiCommand";

import { PasteMode } from "#src/models/resource/sheet/commands/PasteMode";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { ArrowKeyDefinitionMap } from "#src/services/resource/sheet/ArrowKeyDefinitionMap";
import { SHEET_COMMAND_GROUP } from "#src/services/resource/sheet/constants";
import { clampIndex } from "#src/services/ui/clampIndex";
import { getHistoryCommands } from "#src/services/ui/getHistoryCommands";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useColumnStore } from "#src/store/resource/sheet/column";
import { useRowStore } from "#src/store/resource/sheet/row";
import { getSynchronizedFunction } from "@esposter/shared";

// The spreadsheet's keyboard surface: undo and redo, and copy, paste, select-all and extending the cell selection. A
// Cell being edited is a field, where no shortcut fires, and the selection's keys are bound only while there is a
// Selection, so the page's own copy keys work whenever the grid holds none. The arrows that move the selection are the
// Table's own, its grid walking the cells, so they are listed here and never bound
export const useSheetCommands = () => {
  const { redoSheet, undoSheet } = useSheetHistory();
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const rowStore = useRowStore();
  const { displayRows } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { focusedCell, selectedCellRange } = storeToRefs(cellStore);
  const { clearCellSelection, extendCellSelection, startCellSelection } = cellStore;
  const copyRangeToClipboard = getSynchronizedFunction(useCopyRangeToClipboard());
  const pasteRangeFromClipboard = getSynchronizedFunction(usePasteRangeFromClipboard());
  const extendSelection = ([rowDelta, columnDelta]: readonly [number, number]) => {
    // An empty grid has no cell to extend to, so a focus left on a row or column it no longer holds selects nothing
    if (!focusedCell.value || displayRows.value.length === 0 || displayColumns.value.length === 0) return;
    extendCellSelection(
      clampIndex(focusedCell.value.rowIndex + rowDelta, displayRows.value.length),
      clampIndex(focusedCell.value.columnIndex + columnDelta, displayColumns.value.length),
    );
  };

  useCommands((): UiCommand[] => [
    ...getHistoryCommands({
      group: SHEET_COMMAND_GROUP,
      idPrefix: "sheet",
      redo: redoSheet,
      redoTitle: "Redo",
      undo: undoSheet,
      undoTitle: "Undo",
    }),
    {
      group: SHEET_COMMAND_GROUP,
      id: "sheet-select-all",
      meaning: UiIconMeaning.SelectAll,
      run: () => {
        const rowCount = displayRows.value.length;
        const columnCount = displayColumns.value.length;
        if (rowCount === 0 || columnCount === 0) return;
        startCellSelection(0, 0);
        extendCellSelection(rowCount - 1, columnCount - 1);
      },
      shortcut: "cmd+a",
      title: "Select every cell",
    },
    ...(selectedCellRange.value
      ? [
          {
            group: SHEET_COMMAND_GROUP,
            id: "sheet-copy",
            meaning: UiIconMeaning.Copy,
            run: () => {
              copyRangeToClipboard();
            },
            shortcut: "cmd+c",
            title: "Copy cells",
          },
          {
            group: SHEET_COMMAND_GROUP,
            id: "sheet-paste",
            meaning: UiIconMeaning.Paste,
            run: () => {
              pasteRangeFromClipboard(PasteMode.Overwrite);
            },
            shortcut: "cmd+v",
            title: "Paste over cells",
          },
          {
            group: SHEET_COMMAND_GROUP,
            id: "sheet-paste-shift-down",
            meaning: UiIconMeaning.Paste,
            run: () => {
              pasteRangeFromClipboard(PasteMode.ShiftDown);
            },
            shortcut: "cmd+shift+v",
            title: "Paste, moving cells down",
          },
          {
            group: SHEET_COMMAND_GROUP,
            id: "sheet-clear-selection",
            meaning: UiIconMeaning.Clear,
            run: () => {
              clearCellSelection();
            },
            shortcut: "escape",
            title: "Clear the selection",
          },
        ]
      : []),
    ...Object.entries(ArrowKeyDefinitionMap).map(([key, { direction, meaning }]) => ({
      group: SHEET_COMMAND_GROUP,
      id: `sheet-move-${direction}`,
      meaning,
      shortcut: key.toLowerCase(),
      title: `Select the cell ${direction}`,
    })),
    ...(focusedCell.value
      ? Object.entries(ArrowKeyDefinitionMap).map(([key, { delta, direction, meaning }]) => ({
          group: SHEET_COMMAND_GROUP,
          id: `sheet-extend-${direction}`,
          meaning,
          run: () => {
            extendSelection(delta);
          },
          shortcut: `shift+${key.toLowerCase()}`,
          title: `Extend the selection ${direction}`,
        }))
      : []),
  ]);
};
