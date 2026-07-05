import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useCursorPaginationData = <TItem>(): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
  return useCursorPaginationOperationData(cursorPaginationData);
};
