import type { ItemMetadata } from "@/shared/models/itemMetadata";

import { CursorPaginationData } from "~/shared/models/pagination/cursor/CursorPaginationData";
// We want to handle the case where we have a Record<id, CursorPaginationData> scenario
// where we store multiple different lists for different ids, e.g. comments for post ids
export const createCursorPaginationDataMap = <TItem extends ItemMetadata>(
  currentId: MaybeRefOrGetter<string | undefined>,
) => {
  const cursorPaginationDataMap: Ref<Map<string, CursorPaginationData<TItem>>> = ref(new Map());
  const cursorPaginationData = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return new CursorPaginationData<TItem>();
      return cursorPaginationDataMap.value.get(currentIdValue) ?? new CursorPaginationData<TItem>();
    },
    set: (newCursorPaginationData) => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return;
      cursorPaginationDataMap.value.set(currentIdValue, newCursorPaginationData);
    },
  });
  const itemList = computed({
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
    itemList,
    nextCursor,
    resetCursorPaginationData,
  };
};
