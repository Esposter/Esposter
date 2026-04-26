import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

export const readIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, T>,
>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> => {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(storeName, "readonly");
    return await tx.objectStore(storeName).index(indexName).getAll(partitionKey);
  } catch {
    return [];
  }
};
