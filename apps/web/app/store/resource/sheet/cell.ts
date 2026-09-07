import type { CellState } from "@/models/resource/sheet/CellState";

import { CellMode } from "@/models/resource/sheet/CellMode";

export const useCellStore = defineStore("resource/sheet/cell", () => {
  const cellState = ref<CellState>({ mode: CellMode.View });

  const editingCell = computed(() =>
    cellState.value.mode === CellMode.Edit
      ? { columnName: cellState.value.columnName, rowIndex: cellState.value.rowIndex }
      : undefined,
  );

  const selectedCellRange = computed(() => {
    if (cellState.value.mode !== CellMode.Select) return undefined;
    const { anchor, focus } = cellState.value;
    return {
      columnEnd: Math.max(anchor.columnIndex, focus.columnIndex),
      columnStart: Math.min(anchor.columnIndex, focus.columnIndex),
      rowEnd: Math.max(anchor.rowIndex, focus.rowIndex),
      rowStart: Math.min(anchor.rowIndex, focus.rowIndex),
    };
  });

  const requestFocus = (rowIndex: number, columnName: string) => {
    cellState.value = { columnName, mode: CellMode.Edit, rowIndex };
  };
  const clearFocus = () => {
    if (cellState.value.mode === CellMode.Edit) cellState.value = { mode: CellMode.View };
  };
  const checkIsEditingCell = (rowIndex: number, columnName: string) =>
    editingCell.value?.rowIndex === rowIndex && editingCell.value.columnName === columnName;

  const focusedCell = computed(() => (cellState.value.mode === CellMode.Select ? cellState.value.focus : undefined));

  const startCellSelection = (rowIndex: number, columnIndex: number) => {
    cellState.value = {
      anchor: { columnIndex, rowIndex },
      focus: { columnIndex, rowIndex },
      mode: CellMode.Select,
    };
  };
  const extendCellSelection = (rowIndex: number, columnIndex: number) => {
    if (cellState.value.mode !== CellMode.Select) return;
    cellState.value = { ...cellState.value, focus: { columnIndex, rowIndex } };
  };
  const shiftStartCellSelection = (rowIndex: number, columnIndex: number) => {
    if (cellState.value.mode === CellMode.Select) extendCellSelection(rowIndex, columnIndex);
    else startCellSelection(rowIndex, columnIndex);
  };
  const clearCellSelection = () => {
    if (cellState.value.mode === CellMode.Select) cellState.value = { mode: CellMode.View };
  };
  const checkIsCellInRange = (rowIndex: number, columnIndex: number) => {
    if (!selectedCellRange.value) return false;
    const { columnEnd, columnStart, rowEnd, rowStart } = selectedCellRange.value;
    return rowIndex >= rowStart && rowIndex <= rowEnd && columnIndex >= columnStart && columnIndex <= columnEnd;
  };

  return {
    checkIsCellInRange,
    checkIsEditingCell,
    clearCellSelection,
    clearFocus,
    editingCell,
    extendCellSelection,
    focusedCell,
    requestFocus,
    selectedCellRange,
    shiftStartCellSelection,
    startCellSelection,
  };
});
