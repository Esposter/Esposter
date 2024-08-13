import type { ItemMetadata } from "@/models/shared/ItemMetadata";

import { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";
// We want to handle the case where we have a Record<id, CursorPaginationData> scenario
// where we store multiple different lists for different ids, e.g. comments for post ids
export const createCursorPaginationDataMap = <TItem extends ItemMetadata>(currentId: Ref<null | string>) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const cursorPaginationDataMap = ref(new Map()) as Ref<Map<string, CursorPaginationData<TItem>>>;
  const cursorPaginationData = computed({
    get: () => {
      if (!currentId.value) return new CursorPaginationData<TItem>();
      return cursorPaginationDataMap.value.get(currentId.value) ?? new CursorPaginationData<TItem>();
    },
    set: (newCursorPaginationData) => {
      if (!currentId.value) return;
      cursorPaginationDataMap.value.set(currentId.value, newCursorPaginationData);
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
