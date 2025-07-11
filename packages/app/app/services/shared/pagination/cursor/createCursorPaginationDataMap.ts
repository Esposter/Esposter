import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
// We want to handle the case where we have a Record<id, CursorPaginationData> scenario
// where we store multiple different lists for different ids, e.g. comments for post ids
export const createCursorPaginationDataMap = <TItem>(currentId: ReadonlyRefOrGetter<string | undefined>) => {
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
  const items = computed({
    get: () => cursorPaginationData.value.items,
    set: (items) => {
      cursorPaginationData.value.items = items;
    },
  });
  const nextCursor = computed({
    get: () => cursorPaginationData.value.nextCursor,
    set: (nextCursor) => {
      cursorPaginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => cursorPaginationData.value.hasMore,
    set: (hasMore) => {
      cursorPaginationData.value.hasMore = hasMore;
    },
  });

  const initializeCursorPaginationData = (data: CursorPaginationData<TItem>) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
  };

  return {
    hasMore,
    initializeCursorPaginationData,
    items,
    nextCursor,
    resetCursorPaginationData,
  };
};
