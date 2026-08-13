import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { withFinalizerAsync } from "@esposter/shared";

export const useOffsetPaginationOperationData = <TItem>(
  // Resolves the slice to write to, at the moment it is called. An operation binds once up front, so its response
  // Is filed under the key it was issued for rather than whichever key is current by the time it lands.
  bindOffsetPaginationData: () => Ref<OffsetPaginationData<TItem>>,
  // Whether the rows this slice holds are its own, recorded the moment a read lands rather than inferred from
  // The list — an empty list is either "not loaded yet" or "loaded and genuinely empty", and only the load
  // Knows which. Bound the same way, and for the same reason, as the slice it describes
  bindIsLoaded: () => Ref<boolean>,
) => {
  // Binding per read resolves the key every time, which is what makes this track the current slice. It is the
  // Same binder an operation pins once, so the two views can never point at different maps.
  const offsetPaginationData = computed({
    get: () => bindOffsetPaginationData().value,
    set: (newData) => {
      bindOffsetPaginationData().value = newData;
    },
  });
  const isLoaded = computed({
    get: () => bindIsLoaded().value,
    set: (newIsLoaded) => {
      bindIsLoaded().value = newIsLoaded;
    },
  });
  const items = computed({
    get: () => offsetPaginationData.value.items,
    set: (newItems) => {
      offsetPaginationData.value.items = newItems;
    },
  });
  const hasMore = computed({
    get: () => offsetPaginationData.value.hasMore,
    set: (newHasMore) => {
      offsetPaginationData.value.hasMore = newHasMore;
    },
  });

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    offsetPaginationData.value = data;
    isLoaded.value = true;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
    isLoaded.value = false;
  };
  const readItems = async (query: () => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) => {
    const boundOffsetPaginationData = bindOffsetPaginationData();
    const boundIsLoaded = bindIsLoaded();
    await withFinalizerAsync(async () => {
      const newOffsetPaginationData = await query();
      boundOffsetPaginationData.value = newOffsetPaginationData;
      // Readiness is recorded whether the page came back full or empty, so a partition the server says is
      // Empty is distinguishable from one that has not answered yet
      boundIsLoaded.value = true;
    }, onComplete);
  };
  const getReadMoreItems =
    (query: (offset?: number) => Promise<OffsetPaginationData<TItem>>, onComplete?: () => void) =>
    async (offset?: number) => {
      const boundOffsetPaginationData = bindOffsetPaginationData();
      const boundIsLoaded = bindIsLoaded();
      await withFinalizerAsync(async () => {
        const { hasMore: newHasMore, items: newItems } = await query(offset);
        boundOffsetPaginationData.value.hasMore = newHasMore;
        boundOffsetPaginationData.value.items = newItems;
        boundIsLoaded.value = true;
      }, onComplete);
    };

  return {
    getReadMoreItems,
    hasMore,
    initializeOffsetPaginationData,
    isLoaded,
    items,
    readItems,
    resetOffsetPaginationData,
  };
};
