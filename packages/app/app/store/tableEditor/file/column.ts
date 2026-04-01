import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { useTableEditorStore } from "@/store/tableEditor";

export const useColumnStore = defineStore("tableEditor/file/column", () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const search = ref("");
  const selectedColumnIds = ref<string[]>([]);
  const sortBy = ref<readonly SortItem[]>([]);
  const columns = computed(() => tableEditorStore.editedItem?.dataSource?.columns ?? []);
  const displayColumns = computed(() =>
    columns.value.toSorted((a, b) => a.order - b.order).filter((column) => !column.hidden),
  );
  return { columns, displayColumns, search, selectedColumnIds, sortBy };
});
