import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { toAppError, toRawDeep } from "@esposter/shared";
import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { ResultAsync } from "neverthrow";

export const writeIndexedDb = <T extends IndexedDbStoreName, TIndex extends IndexNames<IndexedDbDatabaseSchema, T>>(
  configuration: IndexedDbStoreConfiguration<T, TIndex>,
  items: IndexedDbDatabaseSchema[T]["value"][],
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<void> => {
  const { indexName, limit, storeName } = configuration;
  return ResultAsync.fromPromise(
    openIndexedDb().then(async (db) => {
      const tx = db.transaction(storeName, "readwrite");
      const objectStore = tx.objectStore(storeName);
      const existingKeys = await objectStore.index(indexName).getAllKeys(partitionKey);
      for (const key of existingKeys) await objectStore.delete(key);
      const itemsToCache = limit ? items.slice(0, limit) : items;
      for (const item of itemsToCache) await objectStore.put(toRawDeep(item));
      await tx.done;
    }),
    toAppError,
  )
    .orTee(console.error)
    .unwrapOr(undefined);
};
