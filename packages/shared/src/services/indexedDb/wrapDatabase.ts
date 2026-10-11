import type { Database } from "#src/models/indexedDb/Database";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";

import { wrapObjectStore } from "#src/services/indexedDb/wrapObjectStore";
import { wrapTransaction } from "#src/services/indexedDb/wrapTransaction";

// The shortcuts open a transaction of their own that no `done` is attached to, since a request is the whole of it
export const wrapDatabase = <TSchema extends DatabaseSchema = DatabaseSchema>(
  database: IDBDatabase,
): Database<TSchema> => {
  const getReadonlyObjectStore = <TStoreName extends DatabaseStoreName<TSchema>>(storeName: TStoreName) =>
    wrapObjectStore<TSchema, TStoreName, "readonly">(
      database.transaction(storeName, "readonly").objectStore(storeName),
    );
  const getReadwriteObjectStore = <TStoreName extends DatabaseStoreName<TSchema>>(storeName: TStoreName) =>
    wrapObjectStore<TSchema, TStoreName, "readwrite">(
      database.transaction(storeName, "readwrite").objectStore(storeName),
    );
  const transaction = <TStoreName extends DatabaseStoreName<TSchema>, TMode extends IDBTransactionMode = "readonly">(
    storeNames: readonly TStoreName[] | TStoreName,
    mode?: TMode,
    options?: IDBTransactionOptions,
  ): DatabaseTransaction<TSchema, TStoreName, TMode> => {
    const names = typeof storeNames === "string" ? storeNames : [...storeNames];
    return wrapTransaction<TSchema, TStoreName, TMode>(database.transaction(names, mode, options));
  };
  return {
    close: () => {
      database.close();
    },
    delete: (storeName, query) => getReadwriteObjectStore(storeName).delete(query),
    get: (storeName, key) => getReadonlyObjectStore(storeName).get(key),
    getAll: (storeName, query, count) => getReadonlyObjectStore(storeName).getAll(query, count),
    getAllKeys: (storeName, query, count) => getReadonlyObjectStore(storeName).getAllKeys(query, count),
    name: database.name,
    put: (storeName, value, key) => getReadwriteObjectStore(storeName).put(value, key),
    transaction,
  };
};
