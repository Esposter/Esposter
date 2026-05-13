import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";

interface ReadCursorPaginationCacheOptions<TItem> {
  onCacheRead?: (items: TItem[]) => Promisable<void>;
}

export const useReadCursorPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
>(
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>,
) => {
  const online = useOnline();

  return async (
    partitionKey: IndexKey<IndexedDbDatabaseSchema, TStore, TIndex>,
    query: () => Promise<CursorPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>>,
    options?: ReadCursorPaginationCacheOptions<IndexedDbDatabaseSchema[TStore]["value"]>,
  ) => {
    if (online.value) return query();

    const cachedItems = await readIndexedDb(configuration, partitionKey);
    await options?.onCacheRead?.(cachedItems);
    const cachedData = new CursorPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
    cachedData.items = cachedItems;
    return cachedData;
  };
};
