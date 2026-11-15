import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { Page } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";
import type { TRPCProcedureOptions } from "@trpc/client";

export const useCursorSearcher = <TItem extends ToData<AItemEntity>>(
  query: (searchQuery: string, cursor: string, options?: TRPCProcedureOptions) => Promise<Page<TItem>>,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  // The query whose results are on screen. It moves when a search lands rather than when the text changes, so the
  // Results stay up while the next search loads, and each continuation is read for the query its page came from
  const shownQuery = ref("");
  const { getSlice, hasMore, items, readMoreItems } = useCursorPaginationDataMap<TItem>(shownQuery);
  // Lands a first page as the list on screen. The list it replaces is retired, so a continuation still in flight for
  // It is dropped rather than read into the results that take its place
  const landSearch = (landedQuery: string, page: Page<TItem>) => {
    const replacedQuery = shownQuery.value;
    const landedSlice = getSlice(landedQuery);
    landedSlice.resetCursorPaginationData();
    landedSlice.initializeCursorPaginationData(page);
    if (replacedQuery !== landedQuery) getSlice(replacedQuery).resetCursorPaginationData();
    shownQuery.value = landedQuery;
  };
  // The continuation is read for the query its page was read for, captured here rather than read from the box on each
  // Attempt: a backoff retry after the reader typed on would otherwise ask for the new text with the old cursor
  const readMoreSearchedItems = (onComplete: () => void) => {
    const shownSearchQuery = shownQuery.value;
    return readMoreItems((cursor) => query(shownSearchQuery, cursor), onComplete);
  };
  // Whether an auto search is out or failed, and the retry after one does
  const { isError, isPending, retry } = useAutoSearch(searchQuery, {
    isIncludeEmptySearchQuery,
    reset: () => {
      const replacedQuery = shownQuery.value;
      shownQuery.value = "";
      getSlice(replacedQuery).resetCursorPaginationData();
    },
    search: async (sanitizedSearchQuery, signal) => {
      const page = await query(sanitizedSearchQuery, "", { signal });
      // A search superseded while its answer was on the way is aborted, so its answer never takes the list on screen
      signal.throwIfAborted();
      landSearch(sanitizedSearchQuery, page);
    },
  });

  return { hasMore, isError, isPending, items, readMoreSearchedItems, retry, searchQuery };
};
