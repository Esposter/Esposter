import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const createCursorPaginationOperationData = <TItem>(cursorPaginationData: Ref<CursorPaginationData<TItem>>) => {
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
  const readItems = async (query: () => Promise<CursorPaginationData<TItem>>, onComplete?: () => void) => {
    try {
      const newCursorPaginationData = await query();
      initializeCursorPaginationData(newCursorPaginationData);
    } finally {
      onComplete?.();
    }
  };
  const readMoreItems = async (
    query: (cursor?: string) => Promise<CursorPaginationData<TItem>>,
    onComplete?: () => void,
  ) => {
    try {
      const { hasMore: newHasMore, items: newItems, nextCursor: newNextCursor } = await query(nextCursor.value);
      hasMore.value = newHasMore;
      nextCursor.value = newNextCursor;
      items.value.push(...newItems);
    } finally {
      onComplete?.();
    }
  };

  return {
    hasMore,
    initializeCursorPaginationData,
    items,
    nextCursor,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
  };
};
