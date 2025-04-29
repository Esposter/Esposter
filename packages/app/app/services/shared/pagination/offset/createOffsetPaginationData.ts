import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const createOffsetPaginationData = <TItem>(baseItems?: Ref<TItem[]>) => {
  const offsetPaginationData = ref(new OffsetPaginationData()) as Ref<OffsetPaginationData<TItem>>;
  const items =
    baseItems ??
    computed({
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
    if (baseItems) baseItems.value = offsetPaginationData.value.items;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
    if (baseItems) baseItems.value = [];
  };

  return {
    hasMore,
    initializeOffsetPaginationData,
    items,
    resetOffsetPaginationData,
  };
};
