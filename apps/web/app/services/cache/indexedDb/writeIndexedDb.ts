import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { CompositeKeyPropertyNames } from "@esposter/azure";
import { toRawDeep } from "@esposter/shared";

export const writeIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, T>,
>(
  configuration: IndexedDbStoreConfiguration<T, TIndex>,
  items: IndexedDbDatabaseSchema[T]["value"][],
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<void> => {
  const { indexName, limit, storeName } = configuration;
  const db = await openIndexedDb();
  const tx = db.transaction(storeName, "readwrite");
  const objectStore = tx.objectStore(storeName);
  const existingKeys = await objectStore.index(indexName).getAllKeys(partitionKey);
  const itemsToCache = getCachedItems(items, limit);
  // Requests run in the order they are placed on the transaction, so issuing each phase together still
  // Deletes before it puts — awaiting them one at a time only bought a round trip per row, and a full
  // Rewrite runs on every store write the cached list absorbs
  await Promise.all(existingKeys.map((key) => objectStore.delete(key)));
  // A shallow copy is all the partitionKey stamp needs: `put` structured-clones the record itself, so
  // Cloning deeply first duplicated that work and produced a copy nothing else ever read
  await Promise.all(
    itemsToCache.map((item) =>
      // The stored record is data, not an entity — `put` structured-clones away the prototype regardless
      // oxlint-disable-next-line typescript/no-misused-spread
      objectStore.put({ ...toRawDeep(item), [CompositeKeyPropertyNames.partitionKey]: partitionKey }),
    ),
  );
  await tx.done;
};
