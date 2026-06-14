import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { withFinalizerAsync } from "@esposter/shared";

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
    await withFinalizerAsync(async () => {
      const newOffsetPaginationData = await query();
      initializeOffsetPaginationData(newOffsetPaginationData);
    }, onComplete);
  };
  const getReadMoreItems =
    (query: (offset?: number) => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) =>
    async (offset?: number) => {
      await withFinalizerAsync(async () => {
        const { hasMore: newHasMore, items: newItems } = await query(offset);
        hasMore.value = newHasMore;
        items.value.push(...newItems);
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
