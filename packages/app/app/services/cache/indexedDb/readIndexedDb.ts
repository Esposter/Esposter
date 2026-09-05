import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

// An empty partition and an unreadable one are different facts, so a refused read is raised rather than
// Answered with an empty list
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
