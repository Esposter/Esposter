import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { findMatchingCells } from "@/services/tableEditor/file/commands/findMatchingCells";
import { useTableEditorStore } from "@/store/tableEditor";
import { storeToRefs } from "pinia";

export const useFindReplaceState = createSharedComposable(() => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const findValue = ref("");
  const replaceValue = ref("");
  const isOpen = ref(false);
  const currentOccurrenceIndex = ref(0);

  const occurrences = computed(() => {
    if (!findValue.value || !editedItem.value?.dataSource) return [];
    return findMatchingCells(editedItem.value.dataSource, findValue.value).map(({ columnName, rowIndex }) => ({
      columnName,
      rowIndex,
    }));
  });

  watch(findValue, () => {
    currentOccurrenceIndex.value = 0;
  });

  watch(
    () => occurrences.value.length,
    (length) => {
      if (currentOccurrenceIndex.value >= length) currentOccurrenceIndex.value = Math.max(0, length - 1);
    },
  );

  return { currentOccurrenceIndex, findValue, isOpen, occurrences, replaceValue };
});
