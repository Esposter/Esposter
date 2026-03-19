import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { findMatchingCells } from "@/services/tableEditor/file/commands/findMatchingCells";
import { useTableEditorStore } from "@/store/tableEditor";

export const useFindReplaceStore = defineStore("tableEditor/file/findReplace", () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const isFindReplaceOpen = ref(false);
  const currentOccurrenceIndex = ref(0);
  const findValue = ref("");
  const replaceValue = ref("");
  const occurrences = computed(() => {
    if (!findValue.value || !tableEditorStore.editedItem?.dataSource) return [];
    return findMatchingCells(tableEditorStore.editedItem.dataSource, findValue.value).map(({ columnName, rowIndex }) => ({
      columnName,
      rowIndex,
    }));
  });

  watch(findValue, () => {
    currentOccurrenceIndex.value = 0;
  });

  watch(
    () => occurrences.value.length,
    (newLength) => {
      if (currentOccurrenceIndex.value >= newLength) currentOccurrenceIndex.value = Math.max(0, newLength - 1);
    },
  );

  return { currentOccurrenceIndex, findValue, isFindReplaceOpen, occurrences, replaceValue };
});
