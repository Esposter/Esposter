import { findMatchingCells } from "@/services/resource/file/commands/findMatchingCells";
import { useFileStore } from "@/store/resource/file";

export const useFindReplaceStore = defineStore("resource/file/findReplace", () => {
  const fileStore = useFileStore();
  const isFindReplaceOpen = ref(false);
  const currentOccurrenceIndex = ref(0);
  const findValue = ref("");
  const replaceValue = ref("");
  const occurrences = computed(() => {
    if (!findValue.value) return [];
    return findMatchingCells(fileStore.dataSource, findValue.value).map(({ columnName, rowIndex }) => ({
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
