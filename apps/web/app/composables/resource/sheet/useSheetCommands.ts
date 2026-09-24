import type { UiCommand } from "@/models/ui/UiCommand";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { ArrowKeyDeltaMap } from "@/services/resource/sheet/ArrowKeyDeltaMap";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";

const SHEET_GROUP = "Sheet";
const ArrowTitleMap: Record<string, string> = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
};

// The spreadsheet's keyboard surface: undo and redo, and copy, paste, select-all and arrow navigation over the cell
// Selection. A cell being edited is a field, where no shortcut fires, and the selection's keys are bound only while
// There is a selection, so the page's own copy and arrow keys work whenever the grid holds none
export const useSheetCommands = () => {
  const { redoSheet, undoSheet } = useSheetHistory();
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const rowStore = useRowStore();
  const { filteredRows } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { focusedCell, selectedCellRange } = storeToRefs(cellStore);
  const { clearCellSelection, extendCellSelection, startCellSelection } = cellStore;
  const copyRangeToClipboard = getSynchronizedFunction(useCopyRangeToClipboard());
  const pasteRangeFromClipboard = getSynchronizedFunction(usePasteRangeFromClipboard());
  const moveSelection = (key: string, isExtending: boolean) => {
    const arrowDelta = ArrowKeyDeltaMap[key];
    if (!focusedCell.value || !arrowDelta) return;
    const [rowDelta, columnDelta] = arrowDelta;
    const newRowIndex = Math.max(0, Math.min(filteredRows.value.length - 1, focusedCell.value.rowIndex + rowDelta));
    const newColumnIndex = Math.max(
      0,
      Math.min(displayColumns.value.length - 1, focusedCell.value.columnIndex + columnDelta),
    );
    if (isExtending) extendCellSelection(newRowIndex, newColumnIndex);
    else startCellSelection(newRowIndex, newColumnIndex);
  };

  useCommands((): UiCommand[] => [
    { group: SHEET_GROUP, id: "sheet-undo", run: undoSheet, shortcut: "cmd+z", title: "Undo" },
    { group: SHEET_GROUP, id: "sheet-redo", run: redoSheet, shortcut: "cmd+shift+z", title: "Redo" },
    { group: SHEET_GROUP, id: "sheet-redo-y", run: redoSheet, shortcut: "cmd+y", title: "Redo" },
    {
      group: SHEET_GROUP,
      id: "sheet-select-all",
      run: () => {
        const rowCount = filteredRows.value.length;
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
          { group: SHEET_GROUP, id: "sheet-copy", run: copyRangeToClipboard, shortcut: "cmd+c", title: "Copy cells" },
          {
            group: SHEET_GROUP,
            id: "sheet-paste",
            run: () => {
              pasteRangeFromClipboard(PasteMode.Overwrite);
            },
            shortcut: "cmd+v",
            title: "Paste over cells",
          },
          {
            group: SHEET_GROUP,
            id: "sheet-paste-shift-down",
            run: () => {
              pasteRangeFromClipboard(PasteMode.ShiftDown);
            },
            shortcut: "cmd+shift+v",
            title: "Paste, moving cells down",
          },
          {
            group: SHEET_GROUP,
            id: "sheet-clear-selection",
            run: () => {
              clearCellSelection();
            },
            shortcut: "escape",
            title: "Clear the selection",
          },
        ]
      : []),
    ...(focusedCell.value
      ? Object.entries(ArrowTitleMap).flatMap(([key, direction]) => [
          {
            group: SHEET_GROUP,
            id: `sheet-move-${direction}`,
            run: () => {
              moveSelection(key, false);
            },
            shortcut: key.toLowerCase(),
            title: `Select the cell ${direction}`,
          },
          {
            group: SHEET_GROUP,
            id: `sheet-extend-${direction}`,
            run: () => {
              moveSelection(key, true);
            },
            shortcut: `shift+${key.toLowerCase()}`,
            title: `Extend the selection ${direction}`,
          },
        ])
      : []),
  ]);
};
