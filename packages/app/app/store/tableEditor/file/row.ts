import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { useFilterStore } from "@/store/tableEditor/file/filter";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";

export const useRowStore = defineStore("tableEditor/file/row", () => {
  const filterStore = useFilterStore();
  const findReplaceStore = useFindReplaceStore();
  const itemsPerPage = ref(10);
  const page = ref(1);
  const search = ref("");
  const sortBy = ref<readonly SortItem[]>([]);
  const selectedRowIds = ref<string[]>([]);

  watchDeep(
    () => filterStore.columnFilters,
    () => {
      page.value = 1;
    },
  );

  const navigateToCurrentOccurrence = () => {
    if (itemsPerPage.value === -1) return;
    const occurrence = findReplaceStore.occurrences.at(findReplaceStore.currentOccurrenceIndex);
    if (!occurrence) return;
    page.value = Math.floor(occurrence.rowIndex / itemsPerPage.value) + 1;
  };

  watch([itemsPerPage, () => findReplaceStore.currentOccurrenceIndex, () => findReplaceStore.occurrences], () => {
    navigateToCurrentOccurrence();
  });

  return { itemsPerPage, page, search, selectedRowIds, sortBy };
});
