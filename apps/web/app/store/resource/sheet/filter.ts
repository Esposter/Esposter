import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";

export const useFilterStore = defineStore("resource/sheet/filter", () => {
  const resourceStore = useResourceStore();
  const sheetStore = useSheetStore();
  // Keyed by the sheet, and read back only for the columns it still has: a filter names its column by name, and
  // One carried over from another sheet, or left behind by a rename or a delete, would test every row against a
  // Value it does not hold and hide them all
  const { data: storedColumnFilters } = useDataMap<Record<string, ColumnFilter>>(
    () => resourceStore.currentResourceId,
    {},
  );
  const columnFilters = computed(() => {
    const columnNames = new Set(sheetStore.dataSource.columns.map(({ name }) => name));
    return Object.fromEntries(
      Object.entries(storedColumnFilters.value).filter(([columnName]) => columnNames.has(columnName)),
    );
  });
  const clearColumnFilters = () => {
    storedColumnFilters.value = {};
  };
  const setColumnFilter = (columnName: string, filter: ColumnFilter | undefined) => {
    const { [columnName]: _removedFilter, ...rest } = storedColumnFilters.value;
    storedColumnFilters.value = filter ? { ...rest, [columnName]: filter } : rest;
  };
  return { clearColumnFilters, columnFilters, setColumnFilter };
});
