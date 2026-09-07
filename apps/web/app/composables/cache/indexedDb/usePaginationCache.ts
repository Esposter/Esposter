import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";

// The rows a partition holds are the rows its store keeps, which is the schema's own value type for that store —
// There is no second item type to be generic over: one makes the slice a partition hands back un-assignable to
// The slice the cache asked for
export interface PaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
> {
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>;
  // The rows of one partition and whether they are its own, resolved by naming that partition. Both halves of the
  // Cache name it — the write names the partition it is persisting, the read names the partition it read for — so
  // Neither can act on the list of a partition the reader has switched to since. Readiness cannot come from the
  // List (an empty list is either "not loaded yet" or "loaded and genuinely empty"), so it rides along here,
  // Owned by the store that performed the load and outliving every consumer of this composable.
  getSlice: (partitionKey: PartitionKey<TStore, TIndex>) => {
    initializeItems: (cachedItems: IndexedDbDatabaseSchema[TStore]["value"][]) => void;
    isLoaded: MaybeRefOrGetter<boolean>;
    items: MaybeRefOrGetter<IndexedDbDatabaseSchema[TStore]["value"][]>;
  };
  getWriteItems?: (items: IndexedDbDatabaseSchema[TStore]["value"][]) => IndexedDbDatabaseSchema[TStore]["value"][];
  // The partition rides along, because a hydrate lands after its own await: companion state a consumer updates
  // From it (a member count, a user map) belongs to the partition that was read, not to whichever is current now
  onHydrate?: (
    items: IndexedDbDatabaseSchema[TStore]["value"][],
    partitionKey: PartitionKey<TStore, TIndex>,
  ) => Promisable<void>;
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
>({
  configuration,
  getSlice,
  getWriteItems,
  onHydrate,
  partitionKey,
}: PaginationCacheOptions<TStore, TIndex>) => {
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
      // The rows are restored into the partition they were read for, so switching away needs no guard of its own.
      // What is left is the one question hydration turns on — has THIS partition produced rows since the switch
      // Onto it, and would restoring the cache therefore overwrite live data
      onSuccess: async (cachedItems) => {
        const { initializeItems, isLoaded } = getSlice(newPartitionKey);
        if (cachedItems.length === 0 || toValue(isLoaded)) return;

        initializeItems(cachedItems);
        await onHydrate?.(cachedItems, newPartitionKey);
      },
    });
  });
  // The capped write set is both what gets persisted and what the deep watch tracks. Watching the whole
  // Loaded list instead traverses it on every store write to discover changes that can never reach the cache —
  // A room scrolled back far enough holds many times the rows the cache keeps. Readiness is watched beside it
  // Because a load that lands empty changes nothing in the list, and the previous session's rows would
  // Otherwise stay in the cache — and reachable — for a partition the server has just said is empty. Post-flush
  // Because a write the user is waiting to see rendered comes first; the cache only has to be consistent by the
  // End of the tick
  watchDeep(
    () => {
      const partitionKeyValue = toValue(partitionKey);
      if (!partitionKeyValue) return { isLoaded: false, items: [] };

      const { isLoaded, items } = getSlice(partitionKeyValue);
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
  // Switch the user has no reason to make
  watchImmediate([() => toValue(partitionKey), online], ([newPartitionKey, newOnline]) => {
    if (!newPartitionKey || newOnline) return;

    readCachedItems(newPartitionKey);
  });
  // Nothing to return: both operations are fire-and-forget through getSynchronizedFunction, so a caller that
  // Needs them landed awaits waitForSynchronizedFunctions() — the drain that already covers every one of them
};
