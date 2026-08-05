import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationData = <TItem>(defaultItems?: Ref<TItem[]>) => {
  if (defaultItems) return useOffsetPaginationOperationDataWithDefault(defaultItems);
  const offsetPaginationData = ref(new OffsetPaginationData()) as Ref<OffsetPaginationData<TItem>>;
  const isLoaded = ref(false);
  // One slice, so binding is the identity — the key that could drift does not exist here.
  return useOffsetPaginationOperationData(
    () => offsetPaginationData,
    () => isLoaded,
  );
};
