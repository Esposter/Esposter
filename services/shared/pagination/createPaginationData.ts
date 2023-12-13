import type { Item } from "@/models/shared/Item";
import type { PaginationData } from "@/models/shared/pagination/PaginationData";

export const createPaginationData = <TItem extends Item, TItemKey extends keyof TItem = "id">() => {
  const defaultPaginationData: PaginationData<TItem, TItemKey> = {
    items: [],
    nextCursor: null,
    hasMore: false,
  };
  // @TODO: Vue cannot unwrap generic refs yet
  // https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
  // https://github.com/vuejs/core/issues/6766
  const paginationData = ref(defaultPaginationData) as Ref<PaginationData<TItem, TItemKey>>;
  const items = computed({
    get: () => paginationData.value.items,
    set: (items) => {
      paginationData.value.items = items;
    },
  });
  const nextCursor = computed({
    get: () => paginationData.value.nextCursor,
    set: (nextCursor) => {
      paginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => paginationData.value.hasMore,
    set: (hasMore) => {
      paginationData.value.hasMore = hasMore;
    },
  });
  const initialisePaginationData = (data: PaginationData<TItem, TItemKey>) => {
    paginationData.value = data;
  };
  const resetPaginationData = () => {
    paginationData.value = defaultPaginationData;
  };
  return {
    items,
    nextCursor,
    hasMore,
    initialisePaginationData,
    resetPaginationData,
  };
};
