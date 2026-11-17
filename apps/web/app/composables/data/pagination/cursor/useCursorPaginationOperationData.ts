import type { Page } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { getBoundComputed } from "#src/util/vue/getBoundComputed";
import { getPropertyComputed } from "#src/util/vue/getPropertyComputed";
import { createEmptyPage } from "@esposter/db-schema";
import { checkIsServer, createExponentialBackoff, getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

// The data a reset has replaced. A read issued against it answers a partition that no longer holds that data, so its
// Result is dropped rather than landing on the replacement. A cache hydration replaces data too, but without retiring
// It: the rows it restores are the partition's own, so a read still in flight keeps landing on them
const retiredCursorPaginationData = new WeakSet<object>();
// Empties a partition, retiring the data it held so a read issued against that data is dropped when it lands
export const emptyCursorPaginationData = <TItem>(data: Ref<Page<TItem>>, isLoaded: Ref<boolean>) => {
  retiredCursorPaginationData.add(data.value);
  data.value = createEmptyPage<TItem>();
  isLoaded.value = false;
};

interface ReadItemsOptions<TItem> {
  // Payload key, from `AsyncDataKey`, for a read a server render also issues. Without one the read runs twice
  // For every such page — once for the html, once again as hydration replays the same setup client-side
  key?: string;
  onComplete?: (data: Page<TItem>) => Promisable<void>;
}

export const useCursorPaginationOperationData = <TItem>(
  bindCursorPaginationData: () => Ref<Page<TItem>>,
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
  // A list goes on while it has a cursor to continue from
  const hasMore = computed(() => Boolean(nextCursor.value));
  const initializeCursorPaginationData = (data: Page<TItem>) => {
    cursorPaginationData.value = data;
    isLoaded.value = true;
  };
  const resetCursorPaginationData = () => {
    emptyCursorPaginationData(cursorPaginationData, isLoaded);
  };
  const readItems = async (query: () => Promise<Page<TItem>>, { key, onComplete }: ReadItemsOptions<TItem> = {}) => {
    const isPending = ref(true);
    // Whether the last read failed, so a list shows its error state rather than reading as empty; a refresh clears it
    const isError = ref(false);
    const boundCursorPaginationData = bindCursorPaginationData();
    const boundIsLoaded = bindIsLoaded();
    const storeCursorPaginationData = async (data: Page<TItem>) => {
      boundCursorPaginationData.value = data;
      boundIsLoaded.value = true;
      // Absorbs onComplete errors so data already set above is never lost
      await Promise.allSettled([onComplete?.(data)]);
    };
    // A failed read is recorded rather than thrown, so component setup never fails on it and a retry is a plain call;
    // The tRPC link chain still alerts it
    const refresh = async () => {
      isPending.value = true;
      isError.value = false;
      const issuedCursorPaginationData = boundCursorPaginationData.value;
      await getResultAsync(async () => {
        const data = await query();
        // Answers a reset that landed while the read was in flight: the rows are of the order the reset left behind
        if (retiredCursorPaginationData.has(issuedCursorPaginationData)) return;

        await storeCursorPaginationData(data);
        // The page the html was rendered from rides to the client, so hydration adopts the rows already on
        // Screen rather than fetching a second copy of them
        if (key && checkIsServer()) nuxtApp.payload.data[key] = data;
      }).match(noop, () => {
        isError.value = true;
      });
      isPending.value = false;
    };
    // Only the hydrating render may adopt the payload — a sort change, a pull to refresh and a client-side
    // Navigation all read live. A server read that failed wrote nothing, so hydration issues it again and the
    // TRPC error link surfaces what the server render swallowed
    const hydratedData =
      key && nuxtApp.isHydrating ? (nuxtApp.payload.data[key] as Page<TItem> | undefined) : undefined;
    if (hydratedData) {
      await storeCursorPaginationData(hydratedData);
      isPending.value = false;
    } else await refresh();
    return { isError, isPending, refresh };
  };
  const readMoreItems = async (
    query: (cursor: string) => Promise<Page<TItem>>,
    onComplete?: () => Promisable<void>,
  ) => {
    const boundCursorPaginationData = bindCursorPaginationData();
    await withFinalizerAsync(async () => {
      if (!online.value) return;
      const issuedCursorPaginationData = boundCursorPaginationData.value;
      const { items: newItems, nextCursor: newNextCursor } = await executeWithBackoff(() =>
        query(issuedCursorPaginationData.nextCursor),
      );
      // A page of an order a reset has since replaced belongs to no partition the reader is looking at
      if (retiredCursorPaginationData.has(issuedCursorPaginationData)) return;

      // The page lands on the list it was read for, so a newer read that replaced that list keeps its own rows: the
      // Newest read of a list wins
      issuedCursorPaginationData.nextCursor = newNextCursor;
      issuedCursorPaginationData.items.push(...newItems);
    }, onComplete);
  };

  return {
    hasMore,
    initializeCursorPaginationData,
    isLoaded,
    items,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
  };
};
