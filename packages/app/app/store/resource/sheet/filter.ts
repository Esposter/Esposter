import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

export const useFilterStore = defineStore("resource/sheet/filter", () => {
  const columnFilters = ref<Record<string, ColumnFilter>>({});
  const clearColumnFilters = () => {
    columnFilters.value = {};
  };
  const setColumnFilter = (columnName: string, filter: ColumnFilter | undefined) => {
    const { [columnName]: _removedFilter, ...rest } = columnFilters.value;
    columnFilters.value = filter ? { ...rest, [columnName]: filter } : rest;
  };
  return { clearColumnFilters, columnFilters, setColumnFilter };
});
