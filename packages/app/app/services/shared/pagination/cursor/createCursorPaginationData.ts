import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const createCursorPaginationData = <TItem extends ToData<AEntity>>() => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
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
