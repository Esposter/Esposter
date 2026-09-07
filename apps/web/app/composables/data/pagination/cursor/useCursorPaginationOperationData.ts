import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { getBoundComputed } from "@/util/vue/getBoundComputed";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";
import { checkIsServer, createExponentialBackoff, withFinalizerAsync } from "@esposter/shared";

interface ReadItemsOptions<TItem> {
  // Payload key, from `AsyncDataKey`, for a read a server render also issues. Without one the read runs twice
  // For every such page — once for the html, once again as hydration replays the same setup client-side
  key?: string;
  onComplete?: (data: CursorPaginationData<TItem>) => Promisable<void>;
}

export const useCursorPaginationOperationData = <TItem>(
  bindCursorPaginationData: () => Ref<CursorPaginationData<TItem>>,
  // Whether the rows this slice holds are its own, recorded the moment a read or a hydration lands rather than
  // Inferred from the list — an empty list is either "not loaded yet" or "loaded and genuinely empty", and only
  // The load knows which. Bound the same way, and for the same reason, as the slice it describes
  bindIsLoaded: () => Ref<boolean>,
) => {
  const nuxtApp = useNuxtApp();
  const online = useOnline();
  // The waypoint re-arms via onComplete even when the query fails, so pace retries instead of spinning hot
  const executeWithBackoff = createExponentialBackoff(BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS);
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
    { key, onComplete }: ReadItemsOptions<TItem> = {},
  ) => {
    const isPending = ref(true);
    const boundCursorPaginationData = bindCursorPaginationData();
    const boundIsLoaded = bindIsLoaded();
    const storeCursorPaginationData = async (data: CursorPaginationData<TItem>) => {
      boundCursorPaginationData.value = data;
      boundIsLoaded.value = true;
      // Absorbs onComplete errors so data already set above is never lost
      await Promise.allSettled([onComplete?.(data)]);
    };
    const refresh = async () => {
      isPending.value = true;
      await withFinalizerAsync(
        async () => {
          const data = await query();
          await storeCursorPaginationData(data);
          // The page the html was rendered from rides to the client, so hydration adopts the rows already on
          // Screen rather than fetching a second copy of them
          if (key && checkIsServer()) nuxtApp.payload.data[key] = data;
        },
        () => {
          isPending.value = false;
        },
      );
    };
    // Only the hydrating render may adopt the payload — a sort change, a pull to refresh and a client-side
    // Navigation all read live. A server read that failed wrote nothing, so hydration issues it again and the
    // TRPC error link surfaces what the server render swallowed
    const hydratedData =
      key && nuxtApp.isHydrating ? (nuxtApp.payload.data[key] as CursorPaginationData<TItem> | undefined) : undefined;
    if (hydratedData) {
      await storeCursorPaginationData(hydratedData);
      isPending.value = false;
    }
    // Absorb query errors so component setup never fails; the tRPC link chain handles them.
    else await Promise.allSettled([refresh()]);
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
