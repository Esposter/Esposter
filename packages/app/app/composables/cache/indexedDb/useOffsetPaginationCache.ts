import type { PaginationCacheOptions } from "@/composables/cache/indexedDb/usePaginationCache";
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexNames } from "idb";
import type { Except } from "type-fest";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

interface OffsetPaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
> extends Except<PaginationCacheOptions<TStore, TIndex>, "getSlice"> {
  getSlice: (partitionKey: string) => {
    initializeOffsetPaginationData: (data: OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>) => void;
    isLoaded: MaybeRefOrGetter<boolean>;
    items: MaybeRefOrGetter<IndexedDbDatabaseSchema[TStore]["value"][]>;
  };
}

export const useOffsetPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
>({
  getSlice,
  ...options
}: OffsetPaginationCacheOptions<TStore, TIndex>) => {
  usePaginationCache({
    ...options,
    // The cache stores rows and a slice stores a page of them, so the partition's slice is adapted here rather
    // Than resolved twice — whichever partition the cache names is the one initialized
    getSlice: (partitionKey) => {
      const { initializeOffsetPaginationData, isLoaded, items } = getSlice(partitionKey);
      return {
        initializeItems: (cachedItems) => {
          const cachedData = new OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
          cachedData.items = cachedItems;
          initializeOffsetPaginationData(cachedData);
        },
        isLoaded,
        items,
      };
    },
  });
};
