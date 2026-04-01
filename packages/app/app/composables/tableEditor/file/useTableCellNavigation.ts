import { readonly, ref } from "vue";

const pendingFocusCell = ref<{ columnName: string; rowIndex: number } | null>(null);

export const useTableCellNavigation = () => ({
  clearFocus: () => {
    pendingFocusCell.value = null;
  },
  pendingFocusCell: readonly(pendingFocusCell),
  requestFocus: (rowIndex: number, columnName: string) => {
    pendingFocusCell.value = { columnName, rowIndex };
  },
});
