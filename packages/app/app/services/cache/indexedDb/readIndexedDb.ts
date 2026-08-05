import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

// A refused read is reported to whoever asked for it rather than answered with an empty list here: an empty
// Partition and an unreadable one are different facts, and the caller that runs this through `useMutation`
// Already declares how the cache reports a failure
export const readIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, T>,
>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> => {
  const db = await openIndexedDb();
  return db.transaction(storeName, "readonly").objectStore(storeName).index(indexName).getAll(partitionKey);
};
