import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";

export const useCursorPaginationData = <TItem>(): ReturnType<typeof useCursorPaginationOperationData<TItem>> & {
  getSlice: () => CursorPaginationSlice<TItem>;
} => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
  const isLoaded = ref(false);
  // One slice, so binding is the identity — the key that could drift does not exist here. It still hands one out
  // Under the same name the keyed map uses, so anything writing a paginated list takes the same shape either way
  const getSlice = (): CursorPaginationSlice<TItem> => ({
    initializeCursorPaginationData: (newData) => {
      cursorPaginationData.value = newData;
      isLoaded.value = true;
    },
    isLoaded,
    items: getPropertyComputed(cursorPaginationData, "items"),
  });
  return {
    ...useCursorPaginationOperationData(
      () => cursorPaginationData,
      () => isLoaded,
    ),
    getSlice,
  };
};
