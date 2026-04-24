import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { openCacheDatabase } from "@/services/cache/indexedDb/openCacheDatabase";
import { toRawDeep } from "@esposter/shared";

export const writeCached = async <T extends object>(
  configuration: CacheStoreConfiguration,
  items: T[],
  partitionKey: string,
): Promise<void> => {
  try {
    const { indexName, limit, storeName } = configuration;
    const database = await openCacheDatabase();
    const tx = database.transaction(storeName, "readwrite");
    const objectStore = tx.objectStore(storeName);
    const existingKeys = await objectStore.index(indexName).getAllKeys(partitionKey);
    for (const key of existingKeys) await objectStore.delete(key);
    const itemsToCache = limit ? items.slice(0, limit) : items;
    for (const item of itemsToCache) await objectStore.put(toRawDeep(item) as object);
    await tx.done;
  } catch {
    // Best-effort cache
  }
};
