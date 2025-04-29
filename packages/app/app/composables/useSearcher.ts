import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

import { dayjs } from "#shared/services/dayjs";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";
import { uncapitalize } from "@/util/text/uncapitalize";

type SearcherKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<TEntityTypeKey>}SearchQuery`
  | `${Uncapitalize<TEntityTypeKey>}sSearched`
  | `hasMore${TEntityTypeKey}sSearched`
  | `readMore${TEntityTypeKey}sSearched`;

export const useSearcher = <TItem extends ToData<AEntity>, TEntityTypeKey extends EntityTypeKey>(
  query: (searchQuery: string, cursor?: string) => Promise<CursorPaginationData<TItem>>,
  entityTypeKey: TEntityTypeKey,
) => {
  const searchQuery = ref("");
  const isEmptySearchQuery = computed(() => !searchQuery.value.trim());
  const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
  const { hasMore, initializeCursorPaginationData, itemList, nextCursor, resetCursorPaginationData } =
    createCursorPaginationData<TItem>();
  const readMoreItems = async (onComplete: () => void) => {
    try {
      const response = await query(throttledSearchQuery.value, nextCursor.value);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      itemList.value.push(...response.items);
    } finally {
      onComplete();
    }
  };

  watch(isEmptySearchQuery, (newIsEmptySearchQuery) => {
    if (!newIsEmptySearchQuery) return;
    resetCursorPaginationData();
  });

  watch(throttledSearchQuery, async (newThrottledSearchQuery) => {
    const sanitizedNewThrottledSearchQuery = newThrottledSearchQuery.trim();
    if (!sanitizedNewThrottledSearchQuery) return;
    initializeCursorPaginationData(await query(sanitizedNewThrottledSearchQuery));
  });

  return {
    [`${uncapitalize(entityTypeKey)}SearchQuery`]: searchQuery,
    [`${uncapitalize(entityTypeKey)}sSearched`]: itemList,
    [`hasMore${entityTypeKey}sSearched`]: hasMore,
    [`readMore${entityTypeKey}sSearched`]: readMoreItems,
  } as {
    [P in SearcherKey<TEntityTypeKey>]: P extends `${Uncapitalize<TEntityTypeKey>}SearchQuery`
      ? typeof searchQuery
      : P extends `${Uncapitalize<TEntityTypeKey>}sSearched`
        ? typeof itemList
        : P extends `hasMore${TEntityTypeKey}sSearched`
          ? typeof hasMore
          : P extends `readMore${TEntityTypeKey}sSearched`
            ? typeof readMoreItems
            : never;
  };
};
