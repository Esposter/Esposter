const pendingFocusCell = ref<null | { columnName: string; rowIndex: number }>(null);

export const useTableCellNavigation = () => ({
  clearFocus: () => {
    pendingFocusCell.value = null;
  },
  pendingFocusCell: readonly(pendingFocusCell),
  requestFocus: (rowIndex: number, columnName: string) => {
    pendingFocusCell.value = { columnName, rowIndex };
  },
});
