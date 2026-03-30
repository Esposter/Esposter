import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

export const useFilterStore = defineStore("tableEditor/file/filter", () => {
  const columnFilters = ref<Record<string, ColumnFilter>>({});
  const clearColumnFilters = () => {
    columnFilters.value = {};
  };
  const setColumnFilter = (columnName: string, filter: ColumnFilter | undefined) => {
    const { [columnName]: _, ...rest } = columnFilters.value;
    columnFilters.value = filter ? { ...rest, [columnName]: filter } : rest;
  };
  return { clearColumnFilters, columnFilters, setColumnFilter };
});
