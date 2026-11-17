import type { CursorPaginationSlice } from "#src/models/pagination/cursor/CursorPaginationSlice";
import type { Page } from "@esposter/db-schema";

import { emptyCursorPaginationData } from "#src/composables/data/pagination/cursor/useCursorPaginationOperationData";
import { getPropertyComputed } from "#src/util/vue/getPropertyComputed";
import { createEmptyPage } from "@esposter/db-schema";

export const useCursorPaginationData = <TItem>(): ReturnType<typeof useCursorPaginationOperationData<TItem>> & {
  getSlice: () => CursorPaginationSlice<TItem>;
} => {
  // A cast: Vue's UnwrapRef over the generic item type is not provably the item type the ref holds
  const cursorPaginationData = ref(createEmptyPage<TItem>()) as Ref<Page<TItem>>;
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
    resetCursorPaginationData: () => {
      emptyCursorPaginationData(cursorPaginationData, isLoaded);
    },
  });
  return {
    ...useCursorPaginationOperationData(
      () => cursorPaginationData,
      () => isLoaded,
    ),
    getSlice,
  };
};
