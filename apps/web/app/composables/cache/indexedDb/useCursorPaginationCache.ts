import type { PaginationCacheOptions } from "@/composables/cache/indexedDb/usePaginationCache";
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";
import type { IndexNames } from "idb";
import type { Except } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

interface CursorPaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
> extends Except<PaginationCacheOptions<TStore, TIndex>, "getSlice"> {
  getSlice: (partitionKey: string) => CursorPaginationSlice<IndexedDbDatabaseSchema[TStore]["value"]>;
}

export const useCursorPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
>({
  getSlice,
  ...options
}: CursorPaginationCacheOptions<TStore, TIndex>) => {
  usePaginationCache({
    ...options,
    // The cache stores rows and a slice stores a page of them, so the partition's slice is adapted here rather
    // Than resolved twice — whichever partition the cache names is the one initialized
    getSlice: (partitionKey) => {
      const { initializeCursorPaginationData, isLoaded, items } = getSlice(partitionKey);
      return {
        initializeItems: (cachedItems) => {
          const cachedData = new CursorPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
          cachedData.items = cachedItems;
          initializeCursorPaginationData(cachedData);
        },
        isLoaded,
        items,
      };
    },
  });
};
