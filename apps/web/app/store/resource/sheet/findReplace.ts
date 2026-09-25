import { findMatchingCells } from "@/services/resource/sheet/commands/findMatchingCells";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";

export const useFindReplaceStore = defineStore("resource/sheet/findReplace", () => {
  const resourceStore = useResourceStore();
  const sheetStore = useSheetStore();
  // A search is the sheet's own, so every field of it is keyed by the sheet it was typed into
  const { data: isFindReplaceOpen } = useDataMap(() => resourceStore.currentResourceId, false);
  const { data: currentOccurrenceIndex } = useDataMap(() => resourceStore.currentResourceId, 0);
  const { data: storedFindValue } = useDataMap(() => resourceStore.currentResourceId, "");
  const { data: replaceValue } = useDataMap(() => resourceStore.currentResourceId, "");
  // A new search starts from its first occurrence. Done by the write rather than a watch on the value, which would
  // Also fire on a switch to another sheet and throw away the occurrence that sheet's search was left on
  const findValue = computed({
    get: () => storedFindValue.value,
    set: (newFindValue) => {
      storedFindValue.value = newFindValue;
      currentOccurrenceIndex.value = 0;
    },
  });
  const occurrences = computed(() => {
    if (findValue.value)
      return findMatchingCells(sheetStore.dataSource, findValue.value).map(({ columnName, rowIndex }) => ({
        columnName,
        rowIndex,
      }));
    else return [];
  });
  // The occurrence list is a ring: stepping past either end lands on the other, so Enter keeps cycling
  const goToOccurrence = (delta: number) => {
    if (occurrences.value.length === 0) return;
    currentOccurrenceIndex.value =
      (currentOccurrenceIndex.value + delta + occurrences.value.length) % occurrences.value.length;
  };

  watch(
    () => occurrences.value.length,
    (newLength) => {
      if (currentOccurrenceIndex.value >= newLength) currentOccurrenceIndex.value = Math.max(0, newLength - 1);
    },
  );

  return { currentOccurrenceIndex, findValue, goToOccurrence, isFindReplaceOpen, occurrences, replaceValue };
});
