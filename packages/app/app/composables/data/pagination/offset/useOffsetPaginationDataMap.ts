import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
// Keep a map of id → OffsetPaginationData so we can store separate lists per id (e.g. searched messages per room).
export const useOffsetPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useOffsetPaginationOperationData<TItem>> => {
  const { getBoundData } = useDataMap(currentId, () => new OffsetPaginationData<TItem>());
  // Readiness is keyed like the slice it describes, so it lives and dies with those rows. Held anywhere shorter
  // Lived — a local in whichever composable asks — it starts fresh under a list that did not, and answers for a
  // Partition it never watched load
  const { getBoundData: getBoundIsLoaded } = useDataMap(currentId, false);
  return useOffsetPaginationOperationData(getBoundData, getBoundIsLoaded);
};
