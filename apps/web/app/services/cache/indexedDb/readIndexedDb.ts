import type { IndexedDbDatabaseSchema } from "#src/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "#src/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";
import type { DatabaseIndexKey, DatabaseIndexName } from "@esposter/shared";

import { openIndexedDb } from "#src/services/cache/indexedDb/openIndexedDb";
import { z } from "zod";

// What a record must carry to be restored: the version its row held when the cache wrote it. A record without one was
// Written before the version column existed, and its stored columns would hold against every answer the server gives
const cachedRecordSchema = z.object({ version: z.int().nonnegative() });

// An empty partition and an unreadable one are different facts, so a refused read is raised rather than
// Answered with an empty list
export const readIndexedDb = async <
  T extends IndexedDbStoreName,
  TIndex extends DatabaseIndexName<IndexedDbDatabaseSchema, T>,
>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: DatabaseIndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> => {
  const database = await openIndexedDb();
  const records = await database
    .transaction(storeName, "readonly")
    .objectStore(storeName)
    .index(indexName)
    .getAll(partitionKey);
  return records.filter((record) => cachedRecordSchema.safeParse(record).success);
};
