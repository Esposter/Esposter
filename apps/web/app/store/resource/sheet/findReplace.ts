import { findMatchingCells } from "#src/services/resource/sheet/commands/findMatchingCells";
import { useResourceStore } from "#src/store/resource/index";
import { useSheetStore } from "#src/store/resource/sheet/index";

export const useFindReplaceStore = defineStore("resource/sheet/findReplace", () => {
  const resourceStore = useResourceStore();
  const { checkIsContentRead } = resourceStore;
  const sheetStore = useSheetStore();
  // A search is the sheet's own, so every field of it is keyed by the sheet it was typed into
  const { data: isFindReplaceOpen } = useCurrentResourceDataMap(false);
  const { data: currentOccurrenceIndex } = useCurrentResourceDataMap(0);
  const { data: storedFindValue } = useCurrentResourceDataMap("");
  const { data: replaceValue } = useCurrentResourceDataMap("");
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

  // The occurrences are the open sheet's content, and a switch re-keys the search before that content is read, so the
  // List is the previous sheet's until the read replaces the content. The clamp waits for that read, and runs again
  // When the content is replaced, since a read can leave the count unchanged while the saved occurrence is out of range
  watch([() => occurrences.value.length, () => sheetStore.sheetResource], ([newLength]) => {
    if (!checkIsContentRead()) return;
    if (currentOccurrenceIndex.value >= newLength) currentOccurrenceIndex.value = Math.max(0, newLength - 1);
  });

  return { currentOccurrenceIndex, findValue, goToOccurrence, isFindReplaceOpen, occurrences, replaceValue };
});
