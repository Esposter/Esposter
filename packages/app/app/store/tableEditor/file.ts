import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const columnFilters = ref<Record<string, ColumnFilter>>({});
  const isOutlierHighlightEnabled = ref(false);
  const selectedRowIds = ref<string[]>([]);
  const clearColumnFilters = () => {
    columnFilters.value = {};
  };
  const setColumnFilter = (columnName: string, filter: ColumnFilter | undefined) => {
    const { [columnName]: _, ...rest } = columnFilters.value;
    columnFilters.value = filter ? { ...rest, [columnName]: filter } : rest;
  }
  return { clearColumnFilters, columnFilters, isOutlierHighlightEnabled, selectedRowIds, setColumnFilter };
});
