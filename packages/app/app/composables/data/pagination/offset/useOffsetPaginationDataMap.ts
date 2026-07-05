import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
// Keep a map of id → OffsetPaginationData so we can store separate lists per id (e.g. searched messages per room).
export const useOffsetPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useOffsetPaginationOperationData<TItem>> => {
  const { data: offsetPaginationData } = useDataMap(currentId, () => new OffsetPaginationData<TItem>());
  return useOffsetPaginationOperationData(offsetPaginationData);
};
