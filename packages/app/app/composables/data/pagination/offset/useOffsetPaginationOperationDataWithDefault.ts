import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { withFinalizerAsync } from "@esposter/shared";

export const useOffsetPaginationOperationDataWithDefault = <TItem>(defaultItems: Ref<TItem[]>) => {
  const items = defaultItems;
  const hasMore = ref(false);
  // The caller owns the list, so this slice cannot drift onto another key — readiness is still recorded so the
  // Shape matches the keyed variant a consumer may be handed instead
  const isLoaded = ref(false);

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    hasMore.value = data.hasMore;
    items.value = data.items;
    isLoaded.value = true;
  };
  const resetOffsetPaginationData = () => {
    hasMore.value = false;
    items.value = [];
    isLoaded.value = false;
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
        isLoaded.value = true;
      }, onComplete);
    };

  return {
    getReadMoreItems,
    hasMore,
    initializeOffsetPaginationData,
    isLoaded,
    items,
    readItems,
    resetOffsetPaginationData,
  };
};
