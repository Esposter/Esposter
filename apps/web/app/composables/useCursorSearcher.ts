import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { AEntity } from "@/models/entity/AEntity";
import type { ToData } from "@esposter/shared";
import type { TRPCProcedureOptions } from "@trpc/client";

import { noop } from "@esposter/shared";

export const useCursorSearcher = <TItem extends ToData<AEntity>>(
  query: (searchQuery: string, cursor: string, options?: TRPCProcedureOptions) => Promise<CursorPaginationData<TItem>>,
  isAutoSearch?: true,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const { hasMore, initializeCursorPaginationData, items, readItems, readMoreItems, resetCursorPaginationData } =
    useCursorPaginationData<TItem>();
  const readSearchedItems = (onComplete: () => void) => readItems(() => query(searchQuery.value, ""), { onComplete });
  const readMoreSearchedItems = (onComplete: () => void) =>
    readMoreItems((cursor) => query(searchQuery.value, cursor), onComplete);

  // Whether an auto search is out or failed, and the retry after one does; a search the call site runs itself reads
  // Its own through readSearchedItems
  const autoSearch = isAutoSearch
    ? useAutoSearch(searchQuery, {
        isIncludeEmptySearchQuery,
        reset: () => {
          resetCursorPaginationData();
        },
        search: async (sanitizedSearchQuery, signal) => {
          const cursorPaginationData = await query(sanitizedSearchQuery, "", { signal });
          initializeCursorPaginationData(cursorPaginationData);
        },
      })
    : undefined;

  return {
    hasMore,
    isError: autoSearch?.isError ?? ref(false),
    isPending: autoSearch?.isPending ?? ref(false),
    items,
    readMoreSearchedItems,
    readSearchedItems,
    retry: autoSearch?.retry ?? noop,
    searchQuery,
  };
};
