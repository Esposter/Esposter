import { withFinalizer } from "#shared/error/withFinalizer";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationOperationData = <TItem>(offsetPaginationData: Ref<OffsetPaginationData<TItem>>) => {
  const items = computed({
    get: () => offsetPaginationData.value.items,
    set: (items) => {
      offsetPaginationData.value.items = items;
    },
  });
  const hasMore = computed({
    get: () => offsetPaginationData.value.hasMore,
    set: (hasMore) => {
      offsetPaginationData.value.hasMore = hasMore;
    },
  });

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    offsetPaginationData.value = data;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
  };
  const readItems = async (query: () => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) => {
    await withFinalizer(async () => {
      const newOffsetPaginationData = await query();
      initializeOffsetPaginationData(newOffsetPaginationData);
    }, onComplete);
  };
  const getReadMoreItems =
    (query: (offset?: number) => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) =>
    async (offset?: number) => {
      await withFinalizer(async () => {
        const { hasMore: newHasMore, items: newItems } = await query(offset);
        hasMore.value = newHasMore;
        items.value = newItems;
      }, onComplete);
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
