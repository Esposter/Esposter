import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { useSheetStore } from "@/store/resource/sheet";

export const useColumnStore = defineStore("resource/sheet/column", () => {
  const sheetStore = useSheetStore();
  const search = ref("");
  const selectedColumnIds = ref<string[]>([]);
  const sortBy = ref<SortItem<string>[]>([]);
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
