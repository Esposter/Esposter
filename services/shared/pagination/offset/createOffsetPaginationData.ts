import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { OffsetPaginationData } from "@/models/shared/pagination/offset/OffsetPaginationData";

export const createOffsetPaginationData = <TItem extends ItemMetadata>(items?: Ref<TItem[]>) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const offsetPaginationData = ref(new OffsetPaginationData<TItem>()) as Ref<OffsetPaginationData<TItem>>;
  const itemList =
    items ??
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
    if (items) items.value = offsetPaginationData.value.items;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
    if (items) items.value = [];
  };

  return {
    itemList,
    hasMore,
    initializeOffsetPaginationData,
    resetOffsetPaginationData,
  };
};
