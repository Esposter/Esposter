import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
// Keep a map of id → CursorPaginationData so we can store separate lists per id (e.g. comments per post).
export const useCursorPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useCursorPaginationOperationData<TItem>> => {
  const { getBoundData } = useDataMap(currentId, () => new CursorPaginationData<TItem>());
  // Readiness is keyed like the slice it describes, so it lives and dies with those rows. Held anywhere shorter
  // Lived — a local in whichever composable asks — it starts fresh under a list that did not, and answers for a
  // Partition it never watched load
  const { getBoundData: getBoundIsLoaded } = useDataMap(currentId, false);
  return useCursorPaginationOperationData(getBoundData, getBoundIsLoaded);
};
