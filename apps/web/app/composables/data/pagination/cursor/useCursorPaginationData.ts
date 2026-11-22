import type { CursorPaginationSlice } from "#src/models/pagination/cursor/CursorPaginationSlice";
import type { Page } from "@esposter/db-schema";

import { createCursorPaginationSlice } from "#src/composables/data/pagination/cursor/useCursorPaginationOperationData";
import { createEmptyPage } from "@esposter/db-schema";

export const useCursorPaginationData = <TItem>(): ReturnType<typeof useCursorPaginationOperationData<TItem>> & {
  getSlice: () => CursorPaginationSlice<TItem>;
} => {
  // Vue's UnwrapRef over the generic item type is not provably the item type the ref holds, so the deep ref's type is named here
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- UnwrapRef<Page<TItem>> over a generic TItem is deferred, so the compiler cannot prove it equal to the Page<TItem> the ref holds
  const cursorPaginationData = ref(createEmptyPage<TItem>()) as Ref<Page<TItem>>;
  const isLoaded = ref(false);
  // One slice, so binding is the identity — the key that could drift does not exist here. It still hands one out
  // Under the same name the keyed map uses, so anything writing a paginated list takes the same shape either way
  const getSlice = (): CursorPaginationSlice<TItem> => createCursorPaginationSlice(cursorPaginationData, isLoaded);
  return {
    ...useCursorPaginationOperationData(
      () => cursorPaginationData,
      () => isLoaded,
    ),
    getSlice,
  };
};
