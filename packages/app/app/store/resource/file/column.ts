import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { useFileStore } from "@/store/resource/file";

export const useColumnStore = defineStore("resource/file/column", () => {
  const fileStore = useFileStore();
  const search = ref("");
  const selectedColumnIds = ref<string[]>([]);
  const sortBy = ref<readonly SortItem[]>([]);
  const columns = computed(() => fileStore.dataSource.columns);
  const displayColumns = computed(() => columns.value.filter((column) => !column.hidden));
  return {
    columns,
    displayColumns,
    search,
    selectedColumnIds,
    sortBy,
  };
});
