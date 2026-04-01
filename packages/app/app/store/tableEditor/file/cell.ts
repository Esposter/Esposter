export const useCellStore = defineStore("tableEditor/file/cell", () => {
  const editingCell = ref<null | { columnName: string; rowIndex: number }>(null);
  const clearFocus = () => {
    editingCell.value = null;
  };
  const requestFocus = (rowIndex: number, columnName: string) => {
    editingCell.value = { columnName, rowIndex };
  };
  const isEditingCell = (rowIndex: number, columnName: string) =>
    editingCell.value?.rowIndex === rowIndex && editingCell.value?.columnName === columnName;
  return { clearFocus, isEditingCell, requestFocus };
});
