import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationData = <TItem>(baseItems?: Ref<TItem[]>) => {
  if (baseItems) {
    const hasMore = ref(false);
    const offsetPaginationData = computed({
      get: () => new OffsetPaginationData<TItem>({ hasMore: hasMore.value, items: baseItems.value }),
      set: (newOffsetPaginationData) => {
        baseItems.value = newOffsetPaginationData.items;
        hasMore.value = newOffsetPaginationData.hasMore;
      },
    });
    return useOffsetPaginationOperationData(offsetPaginationData);
  }

  const offsetPaginationData = ref(new OffsetPaginationData()) as Ref<OffsetPaginationData<TItem>>;
  return useOffsetPaginationOperationData(offsetPaginationData);
};
