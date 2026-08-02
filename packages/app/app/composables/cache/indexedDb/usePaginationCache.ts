import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";

// The schema types every index key as a string, which is what lets a partition double as a `useMutation` target
// Verbatim. The conditional cannot resolve while the store stays generic, so the intersection restates the
// Guarantee the schema already makes
type PartitionKey<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
> = IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> & string;

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
  partitionKey: MaybeRefOrGetter<PartitionKey<TStore, TIndex> | undefined>;
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
  // The partition is the target: its writes run one at a time so each rewrite lands on the set the one before
  // It stored, while another partition's cache is a different target and never waits behind it
  const { executeMutation, executeQuery, flush } = useMutation();
  // The partition whose rows on screen are its own, rather than the empty list a load starts from. Dropped on
  // Every switch: carried across one, the list a revisit begins with would pass for a loaded empty partition
  let readyPartitionKey: PartitionKey<TStore, TIndex> | undefined;

  // Both operations are fired from a watcher, so each is adapted to that sync slot rather than floated
  const writeCachedItems = getSynchronizedFunction(
    async (newItems: IndexedDbDatabaseSchema[TStore]["value"][], partitionKeyValue: PartitionKey<TStore, TIndex>) => {
      await executeMutation(() => writeIndexedDb(configuration, newItems, partitionKeyValue), {
        key: partitionKeyValue,
      });
    },
  );
  const readCachedItems = getSynchronizedFunction(async (newPartitionKey: PartitionKey<TStore, TIndex>) => {
    await executeQuery(
      async () => {
        const cachedItems = await readIndexedDb(configuration, newPartitionKey);
        // The partition can move on while IndexedDB answers, and the read for the partition that replaced it
        // Is a different target — latest-wins covers a re-entry into the same partition, never the switch away
        if (toValue(partitionKey) !== newPartitionKey || cachedItems.length === 0 || toValue(items).length > 0) return;

        initializeItems(cachedItems);
        await onHydrate?.(cachedItems);
      },
      // Hydration is a background restore of what the user already had, so a failure is logged, not alerted
      { key: newPartitionKey, onError: console.error },
    );
  });

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
      // Only persist an empty array once this partition has produced data since the switch onto it — clearing
      // The cache on emptied items lets deletions propagate offline, while the empty array an initial load, a
      // Partition switch or a revisit starts from must not clobber rows the hydration is about to restore
      if (newItems.length > 0) readyPartitionKey = partitionKeyValue;
      else if (readyPartitionKey !== partitionKeyValue) return;

      writeCachedItems(newItems, partitionKeyValue);
    },
    { flush: "post" },
  );

  watch(
    () => toValue(partitionKey),
    (newPartitionKey) => {
      // Pre-flush, so the write watcher below sees the partition as unready for the list it arrives holding
      readyPartitionKey = undefined;
      if (!newPartitionKey || online.value) return;

      readCachedItems(newPartitionKey);
    },
  );

  // The cache is written from watchers, so nothing hands the operations back to a caller — a consumer that
  // Needs them landed (a test asserting the stored rows) awaits the primitive's own completion signal rather
  // Than watching a pending flag settle, which would be polling for something the primitive already knows
  return { flush };
};
