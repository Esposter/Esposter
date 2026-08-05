import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";

export interface PaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem,
> {
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>;
  getWriteItems?: (items: TItem[]) => IndexedDbDatabaseSchema[TStore]["value"][];
  initializeItems: (cachedItems: IndexedDbDatabaseSchema[TStore]["value"][]) => void;
  // Whether the rows this partition shows are its own. It is the one question both halves of the cache ask, and
  // The list cannot answer it — an empty list is either "not loaded yet" or "loaded and genuinely empty". The
  // Store that performed the load records it per partition, so it outlives every consumer of this composable
  // Exactly as the rows do; a flag owned here would start fresh on a remount under a list that did not.
  isLoaded: MaybeRefOrGetter<boolean>;
  items: MaybeRefOrGetter<TItem[]>;
  onHydrate?: (items: IndexedDbDatabaseSchema[TStore]["value"][]) => Promisable<void>;
  partitionKey: MaybeRefOrGetter<PartitionKey<TStore, TIndex> | undefined>;
}

// The schema types every index key as a string, which is what lets a partition double as a `useMutation` target
// Verbatim. The conditional cannot resolve while the store stays generic, so the intersection restates the
// Guarantee the schema already makes
type PartitionKey<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
> = IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> & string;

export const usePaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TItem extends IndexedDbDatabaseSchema[TStore]["value"] = IndexedDbDatabaseSchema[TStore]["value"],
>({
  configuration,
  getWriteItems,
  initializeItems,
  isLoaded,
  items,
  onHydrate,
  partitionKey,
}: PaginationCacheOptions<TStore, TIndex, TItem>) => {
  const online = useOnline();
  // The partition is the target: its writes run one at a time so each rewrite lands on the set the one before
  // It stored, while another partition's cache is a different target and never waits behind it
  const { executeMutation, executeQuery } = useMutation();
  // Neither half of the cache is something the user acted on — one mirrors a list they are already looking at,
  // The other restores what they already had — so a failure is logged, never alerted
  const onError = console.error;

  // Both operations are fired from a watcher, so each is adapted to that sync slot rather than floated
  const writeCachedItems = getSynchronizedFunction(
    async (newItems: IndexedDbDatabaseSchema[TStore]["value"][], partitionKeyValue: PartitionKey<TStore, TIndex>) => {
      await executeMutation(() => writeIndexedDb(configuration, newItems, partitionKeyValue), {
        key: partitionKeyValue,
        onError,
      });
    },
  );
  const readCachedItems = getSynchronizedFunction(async (newPartitionKey: PartitionKey<TStore, TIndex>) => {
    await executeQuery(() => readIndexedDb(configuration, newPartitionKey), {
      key: newPartitionKey,
      onError,
      // State is seeded here so the primitive's own staleness filter runs first; only the switch away needs a
      // Guard of its own, because the read for the partition that replaced this one is a different target.
      // Readiness answers the one question hydration turns on — has THIS partition produced rows since the
      // Switch onto it, and would restoring the cache therefore overwrite live data
      onSuccess: async (cachedItems) => {
        if (toValue(partitionKey) !== newPartitionKey || cachedItems.length === 0 || toValue(isLoaded)) return;

        initializeItems(cachedItems);
        await onHydrate?.(cachedItems);
      },
    });
  });

  // The capped write set is both what gets persisted and what the deep watch tracks. Watching the whole
  // Loaded list instead traversed it on every store write to discover changes that can never reach the cache —
  // A room scrolled back far enough holds many times the rows the cache keeps. Readiness is watched beside it
  // Because a load that lands empty changes nothing in the list, and the previous session's rows would
  // Otherwise stay in the cache — and reachable — for a partition the server has just said is empty. Post-flush
  // Because a write the user is waiting to see rendered comes first; the cache only has to be consistent by the
  // End of the tick
  watchDeep(
    () => {
      const currentItems = toValue(items);
      const writeItems = getWriteItems?.(currentItems) ?? currentItems;
      return { isLoaded: toValue(isLoaded), items: getCachedItems(writeItems, configuration.limit) };
    },
    ({ isLoaded: newIsLoaded, items: newItems }) => {
      const partitionKeyValue = toValue(partitionKey);
      // Only a loaded partition persists. Clearing the cache on emptied items lets deletions propagate offline,
      // While the empty list an initial load or a partition switch starts from must not clobber rows the
      // Hydration is about to restore
      if (!partitionKeyValue || !newIsLoaded) return;

      writeCachedItems(newItems, partitionKeyValue);
    },
    { flush: "post" },
  );

  // Both sources restore a partition the user is looking at with no way to fetch it, so both have to fire:
  // Immediate, because the partition a cold start opens on never changes — the room id comes from the route and
  // The layout that calls this already has it at setup, so opening the installed app offline on
  // /messages/{roomId}, the flagship offline case, is precisely the mount where the key arrives already set —
  // And connectivity, because a network lost in place leaves a partition whose load never landed empty until a
  // Switch the user has no reason to make. Watching the key alone covered only a room-to-room switch made
  // Inside an already-running session, which is the one path the tests happened to cover
  watchImmediate([() => toValue(partitionKey), online], ([newPartitionKey, newOnline]) => {
    if (!newPartitionKey || newOnline) return;

    readCachedItems(newPartitionKey);
  });

  // Nothing to return: both operations are fire-and-forget through getSynchronizedFunction, so a caller that
  // Needs them landed awaits waitForSynchronizedFunctions() — the drain that already covers every one of them
};
