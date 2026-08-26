import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";
import type { Except } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { getPropertyComputed } from "@/util/vue/getPropertyComputed";
// Keep a map of id → CursorPaginationData so we can store separate lists per id (e.g. comments per post).
export const useCursorPaginationDataMap = <TItem>(
  currentId: MaybeRefOrGetter<string>,
): Except<ReturnType<typeof useCursorPaginationOperationData<TItem>>, "items"> & {
  // The two binders one partition's operations are built from, for a caller that drives its own reads against a
  // Named key rather than against whichever one is current — a comment tree pages every branch independently,
  // And a branch is a partition nothing else is looking at
  getDataRef: (key: MaybeRefOrGetter<string>) => Ref<CursorPaginationData<TItem>>;
  getIsLoadedRef: (key: MaybeRefOrGetter<string>) => Ref<boolean>;
  getSlice: (key: string) => CursorPaginationSlice<TItem>;
  // The reading view, and only that: it follows whichever id is current, which is what a rendered list wants and
  // Exactly what a write must not use. `readonly` is what makes writing through it impossible rather than merely
  // Discouraged — obtaining a writer means naming the id
  items: ComputedRef<readonly TItem[]>;
  // Every partition the map holds, for a caller that has to look across them — a vote lands on a row wherever the
  // Tree is keeping it, and a counter moves on rows spread over several branches
  keys: ComputedRef<string[]>;
} => {
  const { getBoundData, getDataRef, keys } = useDataMap(currentId, () => new CursorPaginationData<TItem>());
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
  return {
    ...useCursorPaginationOperationData(getBoundData, getBoundIsLoaded),
    getDataRef,
    getIsLoadedRef,
    getSlice,
    keys,
  };
};
