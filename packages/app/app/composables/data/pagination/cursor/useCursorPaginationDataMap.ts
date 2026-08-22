import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";
import type { Except } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";
// Keep a map of id → CursorPaginationData so we can store separate lists per id (e.g. comments per post).
export const useCursorPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): Except<ReturnType<typeof useCursorPaginationOperationData<TItem>>, "items"> & {
  getSlice: (key: string) => CursorPaginationSlice<TItem>;
  // The reading view, and only that: it follows whichever id is current, which is what a rendered list wants and
  // Exactly what a write must not use. `readonly` is what makes writing through it impossible rather than merely
  // Discouraged — `getSlice` is the only way to obtain a writer, and obtaining one means naming the id
  items: ComputedRef<readonly TItem[]>;
} => {
  const { getBoundData, getDataRef } = useDataMap(currentId, () => new CursorPaginationData<TItem>());
  // Readiness is keyed like the slice it describes, so it lives and dies with those rows. Held anywhere shorter
  // Lived — a local in whichever composable asks — it starts fresh under a list that did not, and answers for a
  // Partition it never watched load
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
  return { ...useCursorPaginationOperationData(getBoundData, getBoundIsLoaded), getSlice };
};
