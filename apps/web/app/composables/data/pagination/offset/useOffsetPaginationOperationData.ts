import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { getBoundComputed } from "@/util/vue/getBoundComputed";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";
import { withFinalizerAsync } from "@esposter/shared";

export const useOffsetPaginationOperationData = <TItem>(
  bindOffsetPaginationData: () => Ref<OffsetPaginationData<TItem>>,
  // Whether the rows this slice holds are its own, recorded the moment a read lands rather than inferred from
  // The list — an empty list is either "not loaded yet" or "loaded and genuinely empty", and only the load
  // Knows which. Bound the same way, and for the same reason, as the slice it describes
  bindIsLoaded: () => Ref<boolean>,
) => {
  const { executeQuery } = useMutation();
  // This composable is one list, so its reads are one target
  const readMoreItemsKey = Symbol("readMoreItems");
  const offsetPaginationData = getBoundComputed(bindOffsetPaginationData);
  const isLoaded = getBoundComputed(bindIsLoaded);
  const items = getPropertyComputed(offsetPaginationData, "items");
  const hasMore = getPropertyComputed(offsetPaginationData, "hasMore");

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

  // Appends the next page rather than replacing the slice, which is what an infinite list wants and what
  // `getReadMoreItems` deliberately does not do — a paginator reads a page, a waypoint reads the next one.
  // The offset is the slice's own length, so nothing outside has to track how far the list has been read.
  // Single-flight, because a waypoint re-arms on completion and can fire again while the page it asked for is
  // Still in flight: both calls would read the same length, ask for the same offset and append that page twice
  const readMoreItems = async (
    query: (offset: number) => Promise<OffsetPaginationData<TItem>>,
    onComplete?: () => void,
  ) => {
    const boundOffsetPaginationData = bindOffsetPaginationData();
    const boundIsLoaded = bindIsLoaded();
    await withFinalizerAsync(
      () =>
        executeQuery(
          async () => {
            const { hasMore: newHasMore, items: newItems } = await query(boundOffsetPaginationData.value.items.length);
            boundOffsetPaginationData.value.hasMore = newHasMore;
            boundOffsetPaginationData.value.items = [...boundOffsetPaginationData.value.items, ...newItems];
            boundIsLoaded.value = true;
          },
          { isExclusive: true, key: readMoreItemsKey },
        ),
      onComplete,
    );
  };

  return {
    getReadMoreItems,
    hasMore,
    initializeOffsetPaginationData,
    isLoaded,
    items,
    readItems,
    readMoreItems,
    resetOffsetPaginationData,
  };
};
