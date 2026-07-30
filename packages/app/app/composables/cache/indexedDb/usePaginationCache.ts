import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
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
  // @TODO: loadedPartitionKey only flips after a non-empty page,
  // So an empty first load leaves stale IndexedDB rows behind,
  // And a later revisit can treat a transient empty array as loaded
  // And overwrite cached data before fresh items arrive. Use an explicit
  // Ready/loaded signal instead.
  let loadedPartitionKey: "" | IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> | undefined;

  // The capped write set is both what gets persisted and what the deep watch tracks. Watching the whole
  // Loaded list instead traversed it on every store write to discover changes that can never reach the cache —
  // A room scrolled back far enough holds many times the rows the cache keeps. Post-flush because a write the
  // User is waiting to see rendered comes first; the cache only has to be consistent by the end of the tick
  watchDeep(
    () => {
      const currentItems = toValue(items);
      const writeItems = getWriteItems?.(currentItems) ?? currentItems;
      return getCachedItems(writeItems, configuration.limit);
    },
    (newItems) => {
      const partitionKeyValue = toValue(partitionKey);
      if (!partitionKeyValue) return;
      // Only persist an empty array once this partition has actually produced data — clearing the cache on
      // Emptied items lets deletions propagate offline, while a transient empty array during initial load or a
      // Partition switch (before its data arrives) must not clobber a partition we have not loaded yet.
      if (newItems.length > 0) loadedPartitionKey = partitionKeyValue;
      else if (loadedPartitionKey !== partitionKeyValue) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        await writeIndexedDb(configuration, newItems, partitionKeyValue);
      }).match(noop, console.error);
    },
    { flush: "post" },
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
