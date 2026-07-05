import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { getResultAsync, noop } from "@esposter/shared";

export interface PaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem,
> {
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>;
  getWriteItems?: (items: TItem[]) => IndexedDbDatabaseSchema[TStore]["value"][];
  initializeItems: (cachedItems: IndexedDbDatabaseSchema[TStore]["value"][]) => void;
  items: MaybeRefOrGetter<TItem[]>;
  onHydrate?: (items: IndexedDbDatabaseSchema[TStore]["value"][]) => Promisable<void>;
  partitionKey: MaybeRefOrGetter<"" | IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> | undefined>;
}

export const usePaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem extends IndexedDbDatabaseSchema[TStore]["value"] = IndexedDbDatabaseSchema[TStore]["value"],
>({
  configuration,
  getWriteItems,
  initializeItems,
  items,
  onHydrate,
  partitionKey,
}: PaginationCacheOptions<TStore, TIndex, TItem>) => {
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();
  let loadedPartitionKey: "" | IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> | undefined;

  watchDeep(
    () => toValue(items),
    (newItems) => {
      const partitionKeyValue = toValue(partitionKey);
      if (!partitionKeyValue) return;
      // Only persist an empty array once this partition has actually produced data — clearing the cache on
      // emptied items lets deletions propagate offline, while a transient empty array during initial load or a
      // partition switch (before its data arrives) must not clobber a partition we have not loaded yet.
      if (newItems.length > 0) loadedPartitionKey = partitionKeyValue;
      else if (loadedPartitionKey !== partitionKeyValue) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        await writeIndexedDb(configuration, getWriteItems?.(newItems) ?? newItems, partitionKeyValue);
      }).match(noop, console.error);
    },
  );

  watch(
    () => toValue(partitionKey),
    (newPartitionKey) => {
      if (!newPartitionKey || online.value) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        const cachedItems = await readIndexedDb(configuration, newPartitionKey);
        if (toValue(partitionKey) !== newPartitionKey || cachedItems.length === 0 || toValue(items).length > 0) return;

        initializeItems(cachedItems);
        await onHydrate?.(cachedItems);
      }).match(noop, console.error);
    },
  );

  const flush = () => pendingOperation;
  return { flush };
};
