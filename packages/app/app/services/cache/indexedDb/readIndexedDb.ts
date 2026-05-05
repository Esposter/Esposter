import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { getResultAsync } from "@esposter/shared";
import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";

export const readIndexedDb = <T extends IndexedDbStoreName, TIndex extends IndexNames<IndexedDbDatabaseSchema, T>>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> =>
  getResultAsync(async () => {
    const db = await openIndexedDb();
    return db.transaction(storeName, "readonly").objectStore(storeName).index(indexName).getAll(partitionKey);
  })
    .orTee(console.error)
    .unwrapOr([]);
