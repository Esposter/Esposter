import type { CacheStoreConfiguration } from "@/models/cache/indexedDb/CacheStoreConfiguration";

import { openCacheDatabase } from "@/services/cache/indexedDb/openCacheDatabase";

export const readCached = async <T extends object>(
  configuration: CacheStoreConfiguration,
  partitionKey: string,
): Promise<T[]> => {
  try {
    const { indexName, storeName } = configuration;
    const database = await openCacheDatabase();
    const tx = database.transaction(storeName, "readonly");
    return (await tx.objectStore(storeName).index(indexName).getAll(partitionKey)) as unknown as T[];
  } catch {
    return [];
  }
};
