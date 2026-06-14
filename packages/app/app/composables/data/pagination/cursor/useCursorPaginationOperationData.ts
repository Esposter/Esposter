import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { withFinalizerAsync } from "@esposter/shared";

export const useCursorPaginationOperationData = <TItem>(cursorPaginationData: Ref<CursorPaginationData<TItem>>) => {
  const online = useOnline();
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
  const readItems = async (
    query: () => Promise<CursorPaginationData<TItem>>,
    onComplete?: (data: CursorPaginationData<TItem>) => Promisable<void>,
  ) => {
    const isPending = ref(true);
    const refresh = async () => {
      isPending.value = true;
      await withFinalizerAsync(
        async () => {
          const data = await query();
          initializeCursorPaginationData(data);
          // Absorbs onComplete errors so data already set above is never lost
          await Promise.allSettled([onComplete?.(data)]);
        },
        () => {
          isPending.value = false;
        },
      );
    };
    // Absorb query errors so component setup never fails; the tRPC link chain handles them.
    await Promise.allSettled([refresh()]);
    return { isPending, refresh };
  };
  const readMoreItems = async (
    query: (cursor: string) => Promise<CursorPaginationData<TItem>>,
    onComplete?: () => Promisable<void>,
  ) => {
    await withFinalizerAsync(async () => {
      if (!online.value) return;
      const { hasMore: newHasMore, items: newItems, nextCursor: newNextCursor } = await query(nextCursor.value);
      hasMore.value = newHasMore;
      nextCursor.value = newNextCursor;
      items.value.push(...newItems);
    }, onComplete);
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
