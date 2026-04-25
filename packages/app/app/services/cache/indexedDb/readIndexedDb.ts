import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

export const readIndexedDb = async <T extends IndexedDbStoreName>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T>,
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, IndexNames<IndexedDbDatabaseSchema, T>>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> => {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(storeName, "readonly");
    return await tx.objectStore(storeName).index(indexName).getAll(partitionKey);
  } catch {
    return [];
  }
};
