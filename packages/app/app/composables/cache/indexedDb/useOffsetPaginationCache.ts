import type { PaginationCacheOptions } from "@/composables/cache/indexedDb/usePaginationCache";
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexNames } from "idb";
import type { Except } from "type-fest";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

interface OffsetPaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TSourceItem,
> extends Except<PaginationCacheOptions<TStore, TIndex, TSourceItem>, "initializeItems"> {
  initializeOffsetPaginationData: (data: OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>) => void;
}

export const useOffsetPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TSourceItem extends IndexedDbDatabaseSchema[TStore]["value"] = IndexedDbDatabaseSchema[TStore]["value"],
>({
  initializeOffsetPaginationData,
  ...options
}: OffsetPaginationCacheOptions<TStore, TIndex, TSourceItem>) =>
  usePaginationCache({
    ...options,
    initializeItems: (cachedItems) => {
      const cachedData = new OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
      cachedData.items = cachedItems;
      initializeOffsetPaginationData(cachedData);
    },
  });
