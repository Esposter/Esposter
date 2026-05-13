import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";

interface ReadOffsetPaginationCacheOptions<TItem> {
  onCacheRead?: (items: TItem[]) => Promisable<void>;
}

export const useReadOffsetPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
>(
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>,
) => {
  const online = useOnline();

  return async (
    partitionKey: IndexKey<IndexedDbDatabaseSchema, TStore, TIndex>,
    query: () => Promise<OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>>,
    options?: ReadOffsetPaginationCacheOptions<IndexedDbDatabaseSchema[TStore]["value"]>,
  ) => {
    if (online.value) return query();

    const cachedItems = await readIndexedDb(configuration, partitionKey);
    await options?.onCacheRead?.(cachedItems);
    const cachedData = new OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
    cachedData.items = cachedItems;
    return cachedData;
  };
};
