import { findMatchingCells } from "@/services/resource/sheet/commands/findMatchingCells";
import { useSheetStore } from "@/store/resource/sheet";

export const useFindReplaceStore = defineStore("resource/sheet/findReplace", () => {
  const sheetStore = useSheetStore();
  const isFindReplaceOpen = ref(false);
  const currentOccurrenceIndex = ref(0);
  const findValue = ref("");
  const replaceValue = ref("");
  const occurrences = computed(() => {
    if (!findValue.value) return [];
    return findMatchingCells(sheetStore.dataSource, findValue.value).map(({ columnName, rowIndex }) => ({
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
