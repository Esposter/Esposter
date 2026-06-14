import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
// Keep a Record<id, OffsetPaginationData> so we can store separate lists per id (e.g. searched messages per room).
export const useOffsetPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useOffsetPaginationOperationData<TItem>> => {
  const offsetPaginationDataMap: Ref<Map<string, OffsetPaginationData<TItem>>> = ref(new Map());
  const offsetPaginationData = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return new OffsetPaginationData<TItem>();
      const defaultValue = new OffsetPaginationData<TItem>();
      return (
        offsetPaginationDataMap.value.get(currentIdValue) ??
        offsetPaginationDataMap.value.set(currentIdValue, defaultValue).get(currentIdValue) ??
        defaultValue
      );
    },
    set: (newOffsetPaginationData) => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return;
      offsetPaginationDataMap.value.set(currentIdValue, newOffsetPaginationData);
    },
  });
  return useOffsetPaginationOperationData(offsetPaginationData);
};
