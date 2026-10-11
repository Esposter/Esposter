import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { DatabaseIndexKey, DatabaseIndexName } from "@esposter/shared";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

// An empty partition and an unreadable one are different facts, so a refused read is raised rather than
// Answered with an empty list
export const readIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends DatabaseIndexName<IndexedDbDatabaseSchema, T>,
>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: DatabaseIndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> => {
  const database = await openIndexedDb();
  return database.transaction(storeName, "readonly").objectStore(storeName).index(indexName).getAll(partitionKey);
};
