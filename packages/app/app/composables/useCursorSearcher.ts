import type { AEntity } from "#shared/models/entity/AEntity";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { ToData } from "@esposter/shared";
import type { TRPCProcedureOptions } from "@trpc/client";

export const useCursorSearcher = <TItem extends ToData<AEntity>>(
  query: (searchQuery: string, cursor: string, opts?: TRPCProcedureOptions) => Promise<CursorPaginationData<TItem>>,
  isAutoSearch?: true,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const { hasMore, initializeCursorPaginationData, items, readItems, readMoreItems, resetCursorPaginationData } =
    useCursorPaginationData<TItem>();
  const readSearchedItems = (onComplete: () => void) => readItems(() => query(searchQuery.value, ""), { onComplete });
  const readMoreSearchedItems = (onComplete: () => void) =>
    readMoreItems((cursor) => query(searchQuery.value, cursor), onComplete);

  if (isAutoSearch)
    useAutoSearch(searchQuery, {
      isIncludeEmptySearchQuery,
      reset: resetCursorPaginationData,
      search: async (sanitizedSearchQuery, signal) => {
        const cursorPaginationData = await query(sanitizedSearchQuery, "", { signal });
        initializeCursorPaginationData(cursorPaginationData);
      },
    });

  return {
    hasMore,
    items,
    readMoreSearchedItems,
    readSearchedItems,
    searchQuery,
  };
};
