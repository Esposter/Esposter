import type { CellState } from "@/models/tableEditor/file/CellState";

import { CellMode } from "@/models/tableEditor/file/CellMode";

export const useCellStore = defineStore("tableEditor/file/cell", () => {
  const cellState = ref<CellState>({ mode: CellMode.View });

  const editingCell = computed(() =>
    cellState.value.mode === CellMode.Edit
      ? { columnName: cellState.value.columnName, rowIndex: cellState.value.rowIndex }
      : null,
  );

  const selectedCellRange = computed(() => {
    if (cellState.value.mode !== CellMode.Select) return null;
    const { anchor, focus } = cellState.value;
    return {
      columnEnd: Math.max(anchor.columnIndex, focus.columnIndex),
      columnStart: Math.min(anchor.columnIndex, focus.columnIndex),
      rowEnd: Math.max(anchor.rowIndex, focus.rowIndex),
      rowStart: Math.min(anchor.rowIndex, focus.rowIndex),
    };
  });

  const isSelectingCells = computed(() => cellState.value.mode === CellMode.Select && cellState.value.isSelecting);

  const requestFocus = (rowIndex: number, columnName: string) => {
    cellState.value = { columnName, mode: CellMode.Edit, rowIndex };
  };
  const clearFocus = () => {
    if (cellState.value.mode === CellMode.Edit) cellState.value = { mode: CellMode.View };
  };
  const isEditingCell = (rowIndex: number, columnName: string) =>
    cellState.value.mode === CellMode.Edit &&
    cellState.value.rowIndex === rowIndex &&
    cellState.value.columnName === columnName;

  const focusCell = computed(() => (cellState.value.mode === CellMode.Select ? cellState.value.focus : null));

  const startCellSelection = (rowIndex: number, columnIndex: number) => {
    cellState.value = {
      anchor: { columnIndex, rowIndex },
      focus: { columnIndex, rowIndex },
      isSelecting: true,
      mode: CellMode.Select,
    };
  };
  const shiftStartCellSelection = (rowIndex: number, columnIndex: number) => {
    if (cellState.value.mode === CellMode.Select)
      cellState.value = { ...cellState.value, focus: { columnIndex, rowIndex }, isSelecting: true };
    else startCellSelection(rowIndex, columnIndex);
  };
  const extendCellSelection = (rowIndex: number, columnIndex: number) => {
    if (cellState.value.mode !== CellMode.Select) return;
    cellState.value = { ...cellState.value, focus: { columnIndex, rowIndex } };
  };
  const endCellSelection = () => {
    if (cellState.value.mode === CellMode.Select) cellState.value = { ...cellState.value, isSelecting: false };
  };
  const clearCellSelection = () => {
    if (cellState.value.mode === CellMode.Select) cellState.value = { mode: CellMode.View };
  };
  const isCellInRange = (rowIndex: number, columnIndex: number) => {
    if (!selectedCellRange.value) return false;
    const { columnEnd, columnStart, rowEnd, rowStart } = selectedCellRange.value;
    return rowIndex >= rowStart && rowIndex <= rowEnd && columnIndex >= columnStart && columnIndex <= columnEnd;
  };

  return {
    clearCellSelection,
    clearFocus,
    editingCell,
    endCellSelection,
    extendCellSelection,
    focusCell,
    isCellInRange,
    isEditingCell,
    isSelectingCells,
    requestFocus,
    selectedCellRange,
    shiftStartCellSelection,
    startCellSelection,
  };
});
