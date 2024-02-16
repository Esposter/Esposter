import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";
// We want to handle the case where we have a Record<id, CursorPaginationData> scenario
// where we store multiple different lists for different ids, e.g. comments for post ids
export const createCursorPaginationDataMap = <TItem extends ItemMetadata>(currentId: Ref<string | null>) => {
  const cursorPaginationDataMap = ref<Record<string, CursorPaginationData<TItem>>>({});
  const cursorPaginationData = computed({
    get: () => {
      if (!currentId.value || !cursorPaginationDataMap.value[currentId.value]) return new CursorPaginationData<TItem>();
      else return cursorPaginationDataMap.value[currentId.value];
    },
    set: (newCursorPaginationData) => {
      if (!currentId.value) return;
      else cursorPaginationDataMap.value[currentId.value] = newCursorPaginationData;
    },
  });
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
