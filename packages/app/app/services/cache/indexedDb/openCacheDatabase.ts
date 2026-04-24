import type { CacheDBSchema } from "@/models/cache/indexedDb/CacheDBSchema";
import type { IDBPDatabase } from "idb";

import { CacheStoreConfigurationMap } from "@/services/cache/indexedDb/CacheStoreConfigurationMap";
import { openDB } from "idb";

const CACHE_DATABASE_NAME = "esposter-cache";
const CACHE_DATABASE_VERSION = 1;

let databasePromise: Promise<IDBPDatabase<CacheDBSchema>> | undefined;

export const openCacheDatabase = () => {
  if (databasePromise) return databasePromise;
  databasePromise = openDB<CacheDBSchema>(CACHE_DATABASE_NAME, CACHE_DATABASE_VERSION, {
    upgrade(database) {
      for (const { indexName, keyPath, storeName } of Object.values(CacheStoreConfigurationMap)) {
        const objectStore = database.createObjectStore(storeName, { keyPath: keyPath as string | string[] });
        objectStore.createIndex(indexName, indexName);
      }
    },
  });
  return databasePromise;
};

export const resetCacheDatabase = async () => {
  if (!databasePromise) return;
  const database = await databasePromise;
  database.close();
  databasePromise = undefined;
};
