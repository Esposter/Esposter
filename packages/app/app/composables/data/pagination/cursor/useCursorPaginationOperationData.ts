import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { getBoundComputed } from "@/util/vue/getBoundComputed";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";
import { createExponentialBackoff, withFinalizerAsync } from "@esposter/shared";

export const useCursorPaginationOperationData = <TItem>(
  // Resolves the slice to write to, at the moment it is called. An operation binds once up front, so its response
  // Is filed under the key it was issued for rather than whichever key is current by the time it lands.
  bindCursorPaginationData: () => Ref<CursorPaginationData<TItem>>,
  // Whether the rows this slice holds are its own, recorded the moment a read or a hydration lands rather than
  // Inferred from the list — an empty list is either "not loaded yet" or "loaded and genuinely empty", and only
  // The load knows which. Bound the same way, and for the same reason, as the slice it describes
  bindIsLoaded: () => Ref<boolean>,
) => {
  const online = useOnline();
  // The waypoint re-arms via onComplete even when the query fails, so pace retries instead of spinning hot
  const executeWithBackoff = createExponentialBackoff(BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS);
  // Binding per read resolves the key every time, which is what makes this track the current slice. It is the
  // Same binder an operation pins once, so the two views can never point at different maps.
  const cursorPaginationData = getBoundComputed(bindCursorPaginationData);
  const isLoaded = getBoundComputed(bindIsLoaded);
  const items = getPropertyComputed(cursorPaginationData, "items");
  const nextCursor = getPropertyComputed(cursorPaginationData, "nextCursor");
  const hasMore = getPropertyComputed(cursorPaginationData, "hasMore");
  const initializeCursorPaginationData = (data: CursorPaginationData<TItem>) => {
    cursorPaginationData.value = data;
    isLoaded.value = true;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
    isLoaded.value = false;
  };
  const readItems = async (
    query: () => Promise<CursorPaginationData<TItem>>,
    onComplete?: (data: CursorPaginationData<TItem>) => Promisable<void>,
  ) => {
    const isPending = ref(true);
    const boundCursorPaginationData = bindCursorPaginationData();
    const boundIsLoaded = bindIsLoaded();
    const refresh = async () => {
      isPending.value = true;
      await withFinalizerAsync(
        async () => {
          const data = await query();
          boundCursorPaginationData.value = data;
          // Readiness is recorded whether the page came back full or empty, so a partition the server says is
          // Empty is distinguishable from one that has not answered yet
          boundIsLoaded.value = true;
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
    isLoaded,
    items,
    nextCursor,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
  };
};
