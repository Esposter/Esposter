import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

export const useColumnStore = defineStore("tableEditor/file/column", () => {
  const search = ref("");
  const selectedColumnIds = ref<string[]>([]);
  const sortBy = ref<readonly SortItem[]>([]);
  return { search, selectedColumnIds, sortBy };
});
