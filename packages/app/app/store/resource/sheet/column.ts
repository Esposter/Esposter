import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { useSheetStore } from "@/store/resource/sheet";

export const useColumnStore = defineStore("resource/sheet/column", () => {
  const sheetStore = useSheetStore();
  const search = ref("");
  const selectedColumnIds = ref<string[]>([]);
  const sortBy = ref<readonly SortItem[]>([]);
  const columns = computed(() => sheetStore.dataSource.columns);
  const displayColumns = computed(() => columns.value.filter((column) => !column.hidden));
  return {
    columns,
    displayColumns,
    search,
    selectedColumnIds,
    sortBy,
  };
});
