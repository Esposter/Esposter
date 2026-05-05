import { getResultAsync } from "#shared/error/getResultAsync";
import { withFinalizer } from "#shared/error/withFinalizer";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationOperationDataWithDefault = <TItem>(defaultItems: Ref<TItem[]>) => {
  const items = defaultItems;
  const hasMore = ref(false);

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    hasMore.value = data.hasMore;
    items.value = data.items;
  };
  const resetOffsetPaginationData = () => {
    hasMore.value = false;
    items.value = [];
  };
  const readItems = async (query: () => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) => {
    await withFinalizer(
      getResultAsync(async () => {
        const newOffsetPaginationData = await query();
        initializeOffsetPaginationData(newOffsetPaginationData);
      }),
      () => getResultAsync(() => onComplete?.()),
    );
  };
  const getReadMoreItems =
    (query: (offset?: number) => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) =>
    async (offset?: number) => {
      await withFinalizer(
        getResultAsync(async () => {
          const { hasMore: newHasMore, items: newItems } = await query(offset);
          hasMore.value = newHasMore;
          items.value.push(...newItems);
        }),
        () => getResultAsync(() => onComplete?.()),
      );
    };

  return {
    getReadMoreItems,
    hasMore,
    initializeOffsetPaginationData,
    items,
    readItems,
    resetOffsetPaginationData,
  };
};
