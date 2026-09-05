import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";
import type { Except } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";

export const useCursorPaginationDataMap = <TItem>(
  // Left empty by a caller that has no current partition and names every key instead
  currentId: MaybeRefOrGetter<string> = "",
): Except<ReturnType<typeof useCursorPaginationOperationData<TItem>>, "items"> & {
  getSlice: (key: string) => CursorPaginationSlice<TItem>;
  // One named partition's own reads, for a caller that pages a key rather than whichever one is current
  getSliceOperationData: (key: string) => ReturnType<typeof useCursorPaginationOperationData<TItem>>;
  // The reading view, and only that: it follows whichever id is current, which is what a rendered list wants and
  // Exactly what a write must not use. `readonly` is what makes writing through it impossible rather than merely
  // Discouraged — obtaining a writer means naming the id
  items: ComputedRef<readonly TItem[]>;
  // Every partition the map holds, for a caller that has to look across them
  keys: ComputedRef<string[]>;
} => {
  const { getBoundData, getDataRef, keys } = useDataMap(currentId, () => new CursorPaginationData<TItem>());
  const { getBoundData: getBoundIsLoaded, getDataRef: getIsLoadedRef } = useDataMap(currentId, false);
  const getSlice = (key: string): CursorPaginationSlice<TItem> => {
    const data = getDataRef(key);
    const isLoaded = getIsLoadedRef(key);
    return {
      initializeCursorPaginationData: (newData) => {
        data.value = newData;
        isLoaded.value = true;
      },
      isLoaded,
      items: getPropertyComputed(data, "items"),
    };
  };
  const getSliceOperationData = (key: string) =>
    useCursorPaginationOperationData<TItem>(
      () => getDataRef(key),
      () => getIsLoadedRef(key),
    );
  return {
    ...useCursorPaginationOperationData(getBoundData, getBoundIsLoaded),
    getSlice,
    getSliceOperationData,
    keys,
  };
};
