import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";

import { toAppError } from "@esposter/shared";
import { openIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { ResultAsync } from "neverthrow";

export const readIndexedDb = <T extends IndexedDbStoreName, TIndex extends IndexNames<IndexedDbDatabaseSchema, T>>(
  { indexName, storeName }: IndexedDbStoreConfiguration<T, TIndex>,
  partitionKey: IndexKey<IndexedDbDatabaseSchema, T, TIndex>,
): Promise<IndexedDbDatabaseSchema[T]["value"][]> =>
  ResultAsync.fromPromise(
    openIndexedDb().then((db) =>
      db.transaction(storeName, "readonly").objectStore(storeName).index(indexName).getAll(partitionKey),
    ),
    toAppError,
  )
    .orTee(console.error)
    .unwrapOr([]);
