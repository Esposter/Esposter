import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

import { dayjs } from "#shared/services/dayjs";
import { uncapitalize } from "@esposter/shared";

type SearcherKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<TEntityTypeKey>}SearchQuery`
  | `${Uncapitalize<TEntityTypeKey>}sSearched`
  | `hasMore${TEntityTypeKey}sSearched`
  | `readMore${TEntityTypeKey}sSearched`;

export const useCursorSearcher = <TItem extends ToData<AEntity>, TEntityTypeKey extends EntityTypeKey>(
  query: (searchQuery: string, cursor?: string) => Promise<CursorPaginationData<TItem>>,
  entityTypeKey: TEntityTypeKey,
  isAutoSearch?: true,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const { hasMore, initializeCursorPaginationData, items, nextCursor, resetCursorPaginationData } =
    useCursorPaginationData<TItem>();
  const readMoreItems = async (onComplete: () => void) => {
    try {
      const {
        hasMore: newHasMore,
        items: newItems,
        nextCursor: newNextCursor,
      } = await query(searchQuery.value, nextCursor.value);
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      items.value.push(...newItems);
    } finally {
      onComplete();
    }
  };

  if (isAutoSearch) {
    const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
    const isEmptySearchQuery = computed(() => !searchQuery.value.trim());

    watch(isEmptySearchQuery, (newIsEmptySearchQuery) => {
      if (isIncludeEmptySearchQuery || !newIsEmptySearchQuery) return;
      resetCursorPaginationData();
    });

    watch(
      throttledSearchQuery,
      async (newThrottledSearchQuery) => {
        const sanitizedNewThrottledSearchQuery = newThrottledSearchQuery.trim();
        if (!(isIncludeEmptySearchQuery || sanitizedNewThrottledSearchQuery)) return;
        initializeCursorPaginationData(await query(sanitizedNewThrottledSearchQuery));
      },
      { immediate: isIncludeEmptySearchQuery },
    );
  }

  return {
    [`${uncapitalize(entityTypeKey)}SearchQuery`]: searchQuery,
    [`${uncapitalize(entityTypeKey)}sSearched`]: items,
    [`hasMore${entityTypeKey}sSearched`]: hasMore,
    [`readMore${entityTypeKey}sSearched`]: readMoreItems,
  } as {
    [P in SearcherKey<TEntityTypeKey>]: P extends `${Uncapitalize<TEntityTypeKey>}SearchQuery`
      ? typeof searchQuery
      : P extends `${Uncapitalize<TEntityTypeKey>}sSearched`
        ? typeof items
        : P extends `hasMore${TEntityTypeKey}sSearched`
          ? typeof hasMore
          : P extends `readMore${TEntityTypeKey}sSearched`
            ? typeof readMoreItems
            : never;
  };
};
