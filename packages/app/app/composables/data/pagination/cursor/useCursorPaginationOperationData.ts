import type { ReadItemsCacheOptions } from "@/models/pagination/cursor/ReadItemsCacheOptions";
import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

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
    cacheOptions?: ReadItemsCacheOptions<TItem>,
  ) => {
    const isPending = ref(true);
    const refresh = async () => {
      isPending.value = true;
      try {
        if (!online.value && cacheOptions) {
          const cachedItems = await cacheOptions.cache.read(cacheOptions.partitionKey);
          const cachedData = new CursorPaginationData<TItem>();
          cachedData.items = cachedItems;
          initializeCursorPaginationData(cachedData);
          cacheOptions.onCacheRead?.();
          await Promise.allSettled([onComplete?.(cachedData)]);
          return;
        }
        const data = await query();
        initializeCursorPaginationData(data);
        if (cacheOptions) await cacheOptions.cache.write(data.items, cacheOptions.partitionKey);
        // Absorbs onComplete errors so data already set above is never lost
        await Promise.allSettled([onComplete?.(data)]);
      } finally {
        isPending.value = false;
      }
    };
    // Absorbs query errors so component setup never fails — errors are handled by the tRPC link chain
    await Promise.allSettled([refresh()]);
    return { isPending, refresh };
  };
  const readMoreItems = async (
    query: (cursor?: string) => Promise<CursorPaginationData<TItem>>,
    onComplete?: () => Promisable<void>,
  ) => {
    try {
      const { hasMore: newHasMore, items: newItems, nextCursor: newNextCursor } = await query(nextCursor.value);
      hasMore.value = newHasMore;
      nextCursor.value = newNextCursor;
      items.value.push(...newItems);
    } finally {
      await onComplete?.();
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
