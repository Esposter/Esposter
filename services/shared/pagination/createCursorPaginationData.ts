import { type Item } from "@/models/shared/Item";
import { CursorPaginationData } from "@/models/shared/pagination/CursorPaginationData";

export const createCursorPaginationData = <TItem extends Item, TItemKey extends keyof TItem = "id">() => {
  // @TODO: Vue cannot unwrap generic refs yet
  const cursorPaginationData = ref(new CursorPaginationData<TItem, TItemKey>()) as Ref<
    CursorPaginationData<TItem, TItemKey>
  >;
  const itemList = computed({
    get: () => cursorPaginationData.value.items,
    set: (items) => {
      cursorPaginationData.value.items = items;
    },
  });
  const pushItemList = (items: TItem[]) => {
    itemList.value.push(...items);
  };

  const nextCursor = computed({
    get: () => cursorPaginationData.value.nextCursor,
    set: (nextCursor) => {
      cursorPaginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => cursorPaginationData.value.hasMore,
    set: (hasMore) => {
      cursorPaginationData.value.hasMore = hasMore;
    },
  });

  const initialiseCursorPaginationData = (data: CursorPaginationData<TItem, TItemKey>) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem, TItemKey>();
  };
  return {
    itemList,
    pushItemList,
    nextCursor,
    hasMore,
    initialiseCursorPaginationData,
    resetCursorPaginationData,
  };
};
