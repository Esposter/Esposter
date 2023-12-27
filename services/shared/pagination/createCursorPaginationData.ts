import { type Item } from "@/models/shared/Item";
import { CursorPaginationData } from "@/models/shared/pagination/CursorPaginationData";

export const createCursorPaginationData = <TItem extends Item, TItemKey extends keyof TItem = "id">() => {
  const cursorPaginationData = ref(new CursorPaginationData<TItem, TItemKey>());
  const items = computed({
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
  // @TODO: Vue cannot unwrap generic refs yet
  // https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
  // https://github.com/vuejs/core/issues/6766
  const initialiseCursorPaginationData = (data: typeof cursorPaginationData.value) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem, TItemKey>() as typeof cursorPaginationData.value;
  };
  return {
    items,
    nextCursor,
    hasMore,
    initialiseCursorPaginationData,
    resetCursorPaginationData,
  };
};
