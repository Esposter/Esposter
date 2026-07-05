import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
// Keep a map of id → CursorPaginationData so we can store separate lists per id (e.g. comments per post).
export const useCursorPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const { data: cursorPaginationData } = useDataMap(currentId, () => new CursorPaginationData<TItem>());
  return useCursorPaginationOperationData(cursorPaginationData);
};
