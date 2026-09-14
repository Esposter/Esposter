import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { PartitionKey } from "@/models/cache/indexedDb/PartitionKey";
import type { IndexNames } from "idb";
import type { Promisable } from "type-fest";

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
