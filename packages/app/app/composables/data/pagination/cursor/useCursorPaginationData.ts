import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useCursorPaginationData = <TItem>(): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
  // One slice, so binding is the identity — the key that could drift does not exist here.
  return useCursorPaginationOperationData(() => cursorPaginationData);
};
