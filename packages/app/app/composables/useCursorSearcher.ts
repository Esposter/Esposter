import type { AEntity } from "#shared/models/entity/AEntity";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { ToData } from "@esposter/shared";
import type { TRPCProcedureOptions } from "@trpc/client";

import { dayjs } from "#shared/services/dayjs";
import { normalizeString } from "@esposter/shared";

export const useCursorSearcher = <TItem extends ToData<AEntity>>(
  query: (searchQuery: string, cursor: string, opts?: TRPCProcedureOptions) => Promise<CursorPaginationData<TItem>>,
  isAutoSearch?: true,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const { hasMore, initializeCursorPaginationData, items, readItems, readMoreItems, resetCursorPaginationData } =
    useCursorPaginationData<TItem>();
  const readItemsSearched = (onComplete: () => void) => readItems(() => query(searchQuery.value, ""), onComplete);
  const readMoreItemsSearched = (onComplete: () => void) =>
    readMoreItems((cursor) => query(searchQuery.value, cursor), onComplete);

  if (isAutoSearch) {
    const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
    const isSearchQueryEmpty = computed(() => !normalizeString(searchQuery.value));
    let abortController: AbortController | undefined;

    watch(isSearchQueryEmpty, (newIsSearchQueryEmpty) => {
      if (isIncludeEmptySearchQuery || !newIsSearchQueryEmpty) return;
      abortController?.abort();
      resetCursorPaginationData();
    });

    watch(
      throttledSearchQuery,
      async (newThrottledSearchQuery, oldThrottledSearchQuery) => {
        const sanitizedNewThrottledSearchQuery = normalizeString(newThrottledSearchQuery);
        const sanitizedOldThrottledSearchQuery =
          oldThrottledSearchQuery === undefined ? oldThrottledSearchQuery : normalizeString(oldThrottledSearchQuery);
        if (
          sanitizedNewThrottledSearchQuery === sanitizedOldThrottledSearchQuery ||
          !(isIncludeEmptySearchQuery || sanitizedNewThrottledSearchQuery)
        )
          return;

        abortController?.abort();
        abortController = new AbortController();
        const cursorPaginationData = await query(sanitizedNewThrottledSearchQuery, "", {
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
