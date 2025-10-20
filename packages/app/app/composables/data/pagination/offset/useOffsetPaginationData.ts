import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const useOffsetPaginationData = <TItem>(defaultItems?: WritableComputedRef<TItem[]>) => {
  if (defaultItems) return useOffsetPaginationOperationDataWithDefault(defaultItems);
  const offsetPaginationData = ref(new OffsetPaginationData()) as Ref<OffsetPaginationData<TItem>>;
  return useOffsetPaginationOperationData(offsetPaginationData);
};
