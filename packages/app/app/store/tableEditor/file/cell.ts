interface CellPosition {
  columnIndex: number;
  rowIndex: number;
}

interface CellRange {
  columnEnd: number;
  columnStart: number;
  rowEnd: number;
  rowStart: number;
}

export const useCellStore = defineStore("tableEditor/file/cell", () => {
  const editingCell = ref<null | { columnName: string; rowIndex: number }>(null);
  const selectionAnchor = ref<CellPosition | null>(null);
  const selectionFocus = ref<CellPosition | null>(null);
  const isSelectingCells = ref(false);

  const selectedCellRange = computed<CellRange | null>(() => {
    if (!selectionAnchor.value || !selectionFocus.value) return null;
    return {
      columnEnd: Math.max(selectionAnchor.value.columnIndex, selectionFocus.value.columnIndex),
      columnStart: Math.min(selectionAnchor.value.columnIndex, selectionFocus.value.columnIndex),
      rowEnd: Math.max(selectionAnchor.value.rowIndex, selectionFocus.value.rowIndex),
      rowStart: Math.min(selectionAnchor.value.rowIndex, selectionFocus.value.rowIndex),
    };
  });

  const clearFocus = () => {
    editingCell.value = null;
  };
  const requestFocus = (rowIndex: number, columnName: string) => {
    editingCell.value = { columnName, rowIndex };
  };
  const isEditingCell = (rowIndex: number, columnName: string) =>
    editingCell.value?.rowIndex === rowIndex && editingCell.value.columnName === columnName;

  const startCellSelection = (rowIndex: number, columnIndex: number) => {
    selectionAnchor.value = { columnIndex, rowIndex };
    selectionFocus.value = { columnIndex, rowIndex };
    isSelectingCells.value = true;
  };
  const extendCellSelection = (rowIndex: number, columnIndex: number) => {
    if (!isSelectingCells.value) return;
    selectionFocus.value = { columnIndex, rowIndex };
  };
  const endCellSelection = () => {
    isSelectingCells.value = false;
  };
  const clearCellSelection = () => {
    selectionAnchor.value = null;
    selectionFocus.value = null;
    isSelectingCells.value = false;
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
    isCellInRange,
    isEditingCell,
    isSelectingCells,
    requestFocus,
    selectedCellRange,
    startCellSelection,
  };
});
