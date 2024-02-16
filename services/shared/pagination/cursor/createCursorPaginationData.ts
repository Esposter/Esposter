import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";

export const createCursorPaginationData = <TItem extends ItemMetadata>() => {
  // @TODO: Vue cannot unwrap generic refs yet
  const cursorPaginationData = ref(new CursorPaginationData<TItem>()) as Ref<CursorPaginationData<TItem>>;
  const itemList = computed({
    get: () => cursorPaginationData.value.items,
    set: (items) => {
      cursorPaginationData.value.items = items;
    },
  });
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

  const initializeCursorPaginationData = (data: CursorPaginationData<TItem>) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
  };

  return {
    itemList,
    nextCursor,
    hasMore,
    initializeCursorPaginationData,
    resetCursorPaginationData,
  };
};
