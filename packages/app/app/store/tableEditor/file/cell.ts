export const useCellStore = defineStore("tableEditor/file/cell", () => {
  const pendingFocusCell = ref<null | { columnName: string; rowIndex: number }>(null);
  const clearFocus = () => {
    pendingFocusCell.value = null;
  };
  const requestFocus = (rowIndex: number, columnName: string) => {
    pendingFocusCell.value = { columnName, rowIndex };
  };
  return { clearFocus, pendingFocusCell, requestFocus };
});
