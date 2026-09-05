import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): ReturnType<typeof useOffsetPaginationOperationData<TItem>> => {
  const { getBoundData } = useDataMap(currentId, () => new OffsetPaginationData<TItem>());
  const { getBoundData: getBoundIsLoaded } = useDataMap(currentId, false);
  return useOffsetPaginationOperationData(getBoundData, getBoundIsLoaded);
};
