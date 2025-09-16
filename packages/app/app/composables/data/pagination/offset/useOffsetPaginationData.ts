import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationData = <TItem>(baseItems?: Ref<TItem[]>) => {
  if (baseItems) {
    const hasMore = ref(false);

    const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
      baseItems.value = data.items;
      hasMore.value = data.hasMore;
    };
    const resetOffsetPaginationData = () => {
      baseItems.value = [];
      hasMore.value = false;
    };

    return {
      hasMore,
      initializeOffsetPaginationData,
      items: baseItems,
      resetOffsetPaginationData,
    };
  }

  const offsetPaginationData = ref(new OffsetPaginationData()) as Ref<OffsetPaginationData<TItem>>;
  return useOffsetPaginationOperationData(offsetPaginationData);
};
