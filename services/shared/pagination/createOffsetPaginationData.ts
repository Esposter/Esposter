import type { Item } from "@/models/shared/Item";
import type { OffsetPaginationData } from "@/models/shared/pagination/OffsetPaginationData";

export const createOffsetPaginationData = <TItem extends Item>() => {
  const defaultOffsetPaginationData: OffsetPaginationData<TItem> = {
    items: [],
    hasMore: false,
  };
  // @TODO: Vue cannot unwrap generic refs yet
  // https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
  // https://github.com/vuejs/core/issues/6766
  const offsetPaginationData = ref(defaultOffsetPaginationData) as Ref<OffsetPaginationData<TItem>>;
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
  const initialiseOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    offsetPaginationData.value = data;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = defaultOffsetPaginationData;
  };
  return {
    items,
    hasMore,
    initialiseOffsetPaginationData,
    resetOffsetPaginationData,
  };
};
