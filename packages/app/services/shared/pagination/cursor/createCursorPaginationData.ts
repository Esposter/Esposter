import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";
// It's a little annoying, but because we can have initial reactive data,
// we have to account for that and handle that instead of our own created items array
export const createCursorPaginationData = <TItem extends ItemMetadata>(items?: Ref<TItem[]>) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const cursorPaginationData = ref(new CursorPaginationData<TItem>()) as Ref<CursorPaginationData<TItem>>;
  const itemList =
    items ??
    computed({
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
    if (items) items.value = cursorPaginationData.value.items;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
    if (items) items.value = [];
  };

  return {
    itemList,
    nextCursor,
    hasMore,
    initializeCursorPaginationData,
    resetCursorPaginationData,
  };
};
