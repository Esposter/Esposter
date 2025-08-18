import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

import { dayjs } from "#shared/services/dayjs";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";
import { uncapitalize } from "@esposter/shared";

type SearcherKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<TEntityTypeKey>}SearchQuery`
  | `${Uncapitalize<TEntityTypeKey>}sSearched`
  | `hasMore${TEntityTypeKey}sSearched`
  | `readMore${TEntityTypeKey}sSearched`;

export const useOffsetSearcher = <TItem extends ToData<AEntity>, TEntityTypeKey extends EntityTypeKey>(
  query: (searchQuery: string, offset: number) => Promise<OffsetPaginationData<TItem>>,
  entityTypeKey: TEntityTypeKey,
  isIncludeEmptySearchQuery?: true,
) => {
  const searchQuery = ref("");
  const isEmptySearchQuery = computed(() => !searchQuery.value.trim());
  const throttledSearchQuery = useThrottle(searchQuery, dayjs.duration(1, "second").asMilliseconds());
  const { hasMore, initializeOffsetPaginationData, items, resetOffsetPaginationData } =
    createOffsetPaginationData<TItem>();

  const readMoreItems = async (onComplete: () => void) => {
    try {
      const data = await query(searchQuery.value, items.value.length);
      hasMore.value = data.hasMore;
      items.value.push(...data.items);
    } finally {
      onComplete();
    }
  };

  watch(isEmptySearchQuery, (newEmptySearchQuery) => {
    if (isIncludeEmptySearchQuery || newEmptySearchQuery) return;
    resetOffsetPaginationData();
  });

  watch(
    throttledSearchQuery,
    async (newThrottledSearchQuery) => {
      const sanitizedThrottledSearchQuery = newThrottledSearchQuery.trim();
      if (!(isIncludeEmptySearchQuery || sanitizedThrottledSearchQuery)) return;
      initializeOffsetPaginationData(await query(sanitizedThrottledSearchQuery, 0));
    },
    { immediate: isIncludeEmptySearchQuery },
  );

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
