import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";

import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { toRawDeep } from "@esposter/shared";

export const writeIndexedDb = async (
  configuration: IndexedDbStoreConfiguration,
  items: object[],
  partitionKey: string,
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
