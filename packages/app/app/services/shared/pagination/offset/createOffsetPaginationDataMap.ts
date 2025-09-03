import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
// We want to handle the case where we have a Record<id, OffsetPaginationData> scenario
// where we store multiple different lists for different ids, e.g. searched messages for room ids
export const createOffsetPaginationDataMap = <TItem>(currentId: ReadonlyRefOrGetter<string | undefined>) => {
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

  const items = computed({
    get: () => offsetPaginationData.value.items,
    set: (items) => {
      offsetPaginationData.value.items = items;
    },
  });

  const offset = computed({
    get: () => offsetPaginationData.value.offset,
    set: (newOffset) => {
      offsetPaginationData.value.offset = newOffset;
    },
  });

  const hasMore = computed({
    get: () => offsetPaginationData.value.hasMore,
    set: (hasMore) => {
      offsetPaginationData.value.hasMore = hasMore;
    },
  });

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    offsetPaginationData.value = data;
  };

  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
  };

  return {
    hasMore,
    initializeOffsetPaginationData,
    items,
    offset,
    resetOffsetPaginationData,
  };
};
