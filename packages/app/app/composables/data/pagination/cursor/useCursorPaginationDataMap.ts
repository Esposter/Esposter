import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
// We want to handle the case where we have a Record<id, CursorPaginationData> scenario
// where we store multiple different lists for different ids, e.g. comments for post ids
export const useCursorPaginationDataMap = <TItem>(
  currentId: ReadonlyRefOrGetter<string | undefined>,
): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const cursorPaginationDataMap: Ref<Map<string, CursorPaginationData<TItem>>> = ref(new Map());
  const cursorPaginationData = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return new CursorPaginationData<TItem>();
      const defaultValue = new CursorPaginationData<TItem>();
      return (
        cursorPaginationDataMap.value.get(currentIdValue) ??
        cursorPaginationDataMap.value.set(currentIdValue, defaultValue).get(currentIdValue) ??
        defaultValue
      );
    },
    set: (newCursorPaginationData) => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return;
      cursorPaginationDataMap.value.set(currentIdValue, newCursorPaginationData);
    },
  });
  return useCursorPaginationOperationData(cursorPaginationData);
};
