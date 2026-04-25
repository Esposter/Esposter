import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { toRawDeep } from "@esposter/shared";

export const writeIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, T>,
>(
  configuration: IndexedDbStoreConfiguration<T, TIndex>,
  items: IndexedDbDatabaseSchema[T]["value"][],
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<void> => {
  try {
    const { indexName, limit, storeName } = configuration;
    const db = await openIndexedDb();
    const tx = db.transaction(storeName, "readwrite");
    const objectStore = tx.objectStore(storeName);
    const existingKeys = await objectStore.index(indexName).getAllKeys(partitionKey);
    for (const key of existingKeys) await objectStore.delete(key);
    const itemsToCache = limit ? items.slice(0, limit) : items;
    for (const item of itemsToCache) await objectStore.put(toRawDeep(item));
    await tx.done;
  } catch {
    // Best-effort cache write
  }
};
