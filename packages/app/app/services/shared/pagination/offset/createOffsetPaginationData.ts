import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const createOffsetPaginationData = <TItem>(baseItems?: Ref<TItem[]>) => {
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

  return {
    hasMore,
    initializeOffsetPaginationData,
    items,
    resetOffsetPaginationData,
  };
};
