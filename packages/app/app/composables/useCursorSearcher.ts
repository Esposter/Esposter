import type { AsyncData } from "#app";
import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "@esposter/shared";
import type { TRPCClientErrorLike, TRPCProcedureOptions } from "@trpc/client";
import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { dayjs } from "#shared/services/dayjs";

export const useCursorSearcher = <TItem extends ToData<AEntity>, TDef extends InferrableClientTypes>(
  useQuery: (
    searchQuery: string,
    cursor?: string,
  ) => Promise<Awaited<AsyncData<CursorPaginationData<TItem> | undefined, TRPCClientErrorLike<TDef>>>>,
  query: (searchQuery: string, cursor?: string, opts?: TRPCProcedureOptions) => Promise<CursorPaginationData<TItem>>,
  isAutoSearch?: true,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const { hasMore, initializeCursorPaginationData, items, readItems, readMoreItems, resetCursorPaginationData } =
    useCursorPaginationData<TItem>();
  const readItemsSearched = (onComplete: () => void) => readItems(() => useQuery(searchQuery.value), onComplete);
  const readMoreItemsSearched = (onComplete: () => void) =>
    readMoreItems((cursor) => query(searchQuery.value, cursor), onComplete);

  if (isAutoSearch) {
    const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
    const isSearchQueryEmpty = computed(() => !searchQuery.value.trim());
    let abortController: AbortController | undefined;

    watch(isSearchQueryEmpty, (newIsSearchQueryEmpty) => {
      if (isIncludeEmptySearchQuery || !newIsSearchQueryEmpty) return;
      abortController?.abort();
      resetCursorPaginationData();
    });

    watch(
      throttledSearchQuery,
      async (newThrottledSearchQuery, oldThrottledSearchQuery) => {
        const sanitizedNewThrottledSearchQuery = newThrottledSearchQuery.trim();
        const sanitizedOldThrottledSearchQuery = oldThrottledSearchQuery?.trim();
        if (
          sanitizedNewThrottledSearchQuery === sanitizedOldThrottledSearchQuery ||
          !(isIncludeEmptySearchQuery || sanitizedNewThrottledSearchQuery)
        )
          return;

        abortController?.abort();
        abortController = new AbortController();
        const cursorPaginationData = await query(sanitizedNewThrottledSearchQuery, undefined, {
          signal: abortController.signal,
        });
        initializeCursorPaginationData(cursorPaginationData);
      },
      { immediate: isIncludeEmptySearchQuery },
    );
  }

  return {
    hasMore,
    items,
    readItemsSearched,
    readMoreItemsSearched,
    searchQuery,
  };
};
