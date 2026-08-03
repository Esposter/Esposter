import type { PaginationCacheOptions } from "@/composables/cache/indexedDb/usePaginationCache";
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexNames } from "idb";
import type { Except } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

interface CursorPaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem,
> extends Except<PaginationCacheOptions<TStore, TIndex, TItem>, "initializeItems"> {
  initializeCursorPaginationData: (data: CursorPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>) => void;
}

export const useCursorPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem extends IndexedDbDatabaseSchema[TStore]["value"] = IndexedDbDatabaseSchema[TStore]["value"],
>({
  initializeCursorPaginationData,
  ...options
}: CursorPaginationCacheOptions<TStore, TIndex, TItem>) => {
  usePaginationCache({
    ...options,
    initializeItems: (cachedItems) => {
      const cachedData = new CursorPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
      cachedData.items = cachedItems;
      initializeCursorPaginationData(cachedData);
    },
  });
};
