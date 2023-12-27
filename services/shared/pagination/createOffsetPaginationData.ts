import { type Item } from "@/models/shared/Item";
import { OffsetPaginationData } from "@/models/shared/pagination/OffsetPaginationData";

export const createOffsetPaginationData = <TItem extends Item>() => {
  // @TODO: Vue cannot unwrap generic refs yet
  const offsetPaginationData = ref(new OffsetPaginationData<TItem>()) as Ref<OffsetPaginationData<TItem>>;
  const itemList = computed({
    get: () => offsetPaginationData.value.items,
    set: (items) => {
      offsetPaginationData.value.items = items;
    },
  });
  const pushItemList = (items: TItem[]) => {
    itemList.value.push(...items);
  };

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
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
  };
  return {
    itemList,
    pushItemList,
    hasMore,
    initialiseOffsetPaginationData,
    resetOffsetPaginationData,
  };
};
