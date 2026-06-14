import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
// Keep a Record<id, CursorPaginationData> so we can store separate lists per id (e.g. comments per post).
export const useCursorPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const cursorPaginationDataMap: Ref<Map<string, CursorPaginationData<TItem>>> = ref(new Map());
  const cursorPaginationData = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return new CursorPaginationData<TItem>();
      const defaultValue = new CursorPaginationData<TItem>();
      return (
        cursorPaginationDataMap.value.get(currentIdValue) ??
        cursorPaginationDataMap.value.set(currentIdValue, defaultValue).get(currentIdValue) ??
        defaultValue
      );
    },
    set: (newCursorPaginationData) => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return;
      cursorPaginationDataMap.value.set(currentIdValue, newCursorPaginationData);
    },
  });
  return useCursorPaginationOperationData(cursorPaginationData);
};
