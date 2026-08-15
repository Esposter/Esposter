import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { ArrowKeyDeltaMap } from "@/services/resource/sheet/ArrowKeyDeltaMap";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";

const getIsInputFocused = () => {
  const activeElement = window.document.activeElement;
  return activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
};

// The spreadsheet's keyboard surface: copy, paste, select-all and arrow navigation over the cell selection.
// Every handler stands down while a cell is being edited or an input holds focus, so typing into a cell never
// Reaches the grid
export const useCellKeyboardShortcuts = () => {
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const rowStore = useRowStore();
  const { filteredRows } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { editingCell, focusCell, selectedCellRange } = storeToRefs(cellStore);
  const { clearCellSelection, extendCellSelection, startCellSelection } = cellStore;
  const copyRangeToClipboard = useCopyRangeToClipboard();
  const pasteRangeFromClipboard = usePasteRangeFromClipboard();

  onKeyStroke(
    ["c", "C"],
    getSynchronizedFunction(async (event: KeyboardEvent) => {
      if (
        editingCell.value ||
        getIsInputFocused() ||
        (!event.ctrlKey && !event.metaKey) ||
        event.shiftKey ||
        !selectedCellRange.value
      )
        return;
      event.preventDefault();
      await copyRangeToClipboard();
    }),
  );

  onKeyStroke(
    ["v", "V"],
    getSynchronizedFunction(async (event: KeyboardEvent) => {
      if (editingCell.value || getIsInputFocused() || (!event.ctrlKey && !event.metaKey) || !selectedCellRange.value)
        return;
      event.preventDefault();
      await pasteRangeFromClipboard(event.shiftKey ? PasteMode.ShiftDown : PasteMode.Overwrite);
    }),
  );

  onKeyStroke(["a", "A"], (event) => {
    if (editingCell.value || getIsInputFocused() || (!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
    event.preventDefault();
    const rowCount = filteredRows.value.length;
    const columnCount = displayColumns.value.length;
    if (rowCount > 0 && columnCount > 0) {
      startCellSelection(0, 0);
      extendCellSelection(rowCount - 1, columnCount - 1);
    }
  });

  onKeyStroke(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"], (event) => {
    if (editingCell.value || getIsInputFocused() || !focusCell.value) return;
    const arrowDelta = ArrowKeyDeltaMap[event.key];
    if (!arrowDelta) return;
    event.preventDefault();
    const [rowDelta, columnDelta] = arrowDelta;
    const rowCount = filteredRows.value.length;
    const columnCount = displayColumns.value.length;
    const newRowIndex = Math.max(0, Math.min(rowCount - 1, focusCell.value.rowIndex + rowDelta));
    const newColumnIndex = Math.max(0, Math.min(columnCount - 1, focusCell.value.columnIndex + columnDelta));
    if (event.shiftKey) extendCellSelection(newRowIndex, newColumnIndex);
    else startCellSelection(newRowIndex, newColumnIndex);
  });

  onKeyStroke("Escape", () => {
    if (editingCell.value || getIsInputFocused()) return;
    clearCellSelection();
  });
};
