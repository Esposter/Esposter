import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { createExponentialBackoff, withFinalizerAsync } from "@esposter/shared";

export const useCursorPaginationOperationData = <TItem>(
  // Resolves the slice to write to, at the moment it is called. An operation binds once up front, so its response
  // Is filed under the key it was issued for rather than whichever key is current by the time it lands.
  bindCursorPaginationData: () => Ref<CursorPaginationData<TItem>>,
) => {
  const online = useOnline();
  // The waypoint re-arms via onComplete even when the query fails, so pace retries instead of spinning hot
  const executeWithBackoff = createExponentialBackoff(BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS);
  // Binding per read resolves the key every time, which is what makes this track the current slice. It is the
  // Same binder an operation pins once, so the two views can never point at different maps.
  const cursorPaginationData = computed({
    get: () => bindCursorPaginationData().value,
    set: (newData) => {
      bindCursorPaginationData().value = newData;
    },
  });
  const items = computed({
    get: () => cursorPaginationData.value.items,
    set: (newItems) => {
      cursorPaginationData.value.items = newItems;
    },
  });
  const nextCursor = computed({
    get: () => cursorPaginationData.value.nextCursor,
    set: (newNextCursor) => {
      cursorPaginationData.value.nextCursor = newNextCursor;
    },
  });
  const hasMore = computed({
    get: () => cursorPaginationData.value.hasMore,
    set: (newHasMore) => {
      cursorPaginationData.value.hasMore = newHasMore;
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
    const boundCursorPaginationData = bindCursorPaginationData();
    const refresh = async () => {
      isPending.value = true;
      await withFinalizerAsync(
        async () => {
          const data = await query();
          boundCursorPaginationData.value = data;
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
    const boundCursorPaginationData = bindCursorPaginationData();
    await withFinalizerAsync(async () => {
      if (!online.value) return;
      const {
        hasMore: newHasMore,
        items: newItems,
        nextCursor: newNextCursor,
      } = await executeWithBackoff(() => query(boundCursorPaginationData.value.nextCursor));
      boundCursorPaginationData.value.hasMore = newHasMore;
      boundCursorPaginationData.value.nextCursor = newNextCursor;
      boundCursorPaginationData.value.items.push(...newItems);
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
