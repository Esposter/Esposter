import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";

export const useColumnStore = defineStore("resource/sheet/column", () => {
  const resourceStore = useResourceStore();
  const sheetStore = useSheetStore();
  // The column table's view is the sheet's own, so each field is keyed by the sheet it describes
  const { data: search } = useDataMap(() => resourceStore.currentResourceId, "");
  const { data: selectedColumnIds } = useDataMap<string[]>(() => resourceStore.currentResourceId, []);
  const { data: sortBy } = useDataMap<SortItem<string>[]>(() => resourceStore.currentResourceId, []);
  const columns = computed(() => sheetStore.dataSource.columns);
  const displayColumns = computed(() => getVisibleColumns(columns.value));
  return {
    columns,
    displayColumns,
    search,
    selectedColumnIds,
    sortBy,
  };
});
