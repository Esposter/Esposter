import type { DatabaseIndexCreator } from "#src/models/indexedDb/DatabaseIndexCreator";
import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseObjectStore } from "#src/models/indexedDb/DatabaseObjectStore";
import type { DatabaseObjectStoreReader } from "#src/models/indexedDb/DatabaseObjectStoreReader";
import type { DatabaseObjectStoreWriter } from "#src/models/indexedDb/DatabaseObjectStoreWriter";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

import { requestToPromise } from "#src/services/indexedDb/requestToPromise";
import { wrapIndex } from "#src/services/indexedDb/wrapIndex";

export const wrapObjectStore = <
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TMode extends IDBTransactionMode,
>(
  objectStore: IDBObjectStore,
): DatabaseObjectStore<TSchema, TStoreName, TMode> => {
  const reader: DatabaseObjectStoreReader<TSchema, TStoreName> = {
    get: (key) => requestToPromise(objectStore.get(key)),
    getAll: (query, count) => requestToPromise(objectStore.getAll(query, count)),
    getAllKeys: (query, count) => requestToPromise(objectStore.getAllKeys(query, count)),
    index: <TIndexName extends DatabaseIndexName<TSchema, TStoreName>>(name: TIndexName) =>
      wrapIndex<TSchema, TStoreName, TIndexName>(objectStore.index(name)),
  };
  const writer: DatabaseObjectStoreWriter<TSchema, TStoreName> = {
    delete: (query) => requestToPromise(objectStore.delete(query)),
    put: (value, key) => requestToPromise(objectStore.put(value, key)),
  };
  const creator: DatabaseIndexCreator<TSchema, TStoreName> = {
    createIndex: (name, keyPath, options) => {
      objectStore.createIndex(name, keyPath, options);
    },
  };
  // eslint-disable-next-line no-restricted-syntax -- The mode is the caller's and selects which of these methods the type keeps, so this function cannot resolve the conditional it returns
  return { ...reader, ...writer, ...creator } as unknown as DatabaseObjectStore<TSchema, TStoreName, TMode>;
};
