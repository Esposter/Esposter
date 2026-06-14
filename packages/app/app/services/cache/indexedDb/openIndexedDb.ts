import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IDBPDatabase } from "idb";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { openDB } from "idb";

const DATABASE_NAME = "esposter";
const DATABASE_VERSION = 1;

let databasePromise: Promise<IDBPDatabase<IndexedDbDatabaseSchema>> | undefined;

export const openIndexedDb = (): Promise<IDBPDatabase<IndexedDbDatabaseSchema>> => {
  if (databasePromise) return databasePromise;
  const promise = openDB<IndexedDbDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (db) => {
      const configurations = [
        MemberIndexedDbStoreConfiguration,
        MessageIndexedDbStoreConfiguration,
        RoomIndexedDbStoreConfiguration,
      ];
      for (const { indexName, keyPath, storeName } of configurations) {
        const objectStore = db.createObjectStore(storeName, { keyPath });
        objectStore.createIndex(indexName, indexName);
      }
    },
  });
  getSynchronizedFunction(async () => {
    await getResultAsync(() => promise).match(noop, (error) => {
      console.error(error);
      if (databasePromise === promise) databasePromise = undefined;
    });
  })();
  databasePromise = promise;
  return databasePromise;
};

export const resetIndexedDb = async () => {
  const db = await databasePromise;
  if (db) {
    db.close();
    const deleteRequest = indexedDB.deleteDatabase(db.name);
    await new Promise<void>((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        resolve();
      };
      deleteRequest.onerror = () => {
        reject(
          deleteRequest.error ?? new InvalidOperationError(Operation.Delete, indexedDB.deleteDatabase.name, db.name),
        );
      };
      deleteRequest.onblocked = () => {
        resolve();
      };
    });
  }
  databasePromise = undefined;
};
