import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { Database } from "@esposter/shared";

import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import {
  getResultAsync,
  getSynchronizedFunction,
  InvalidOperationError,
  noop,
  openDatabase,
  Operation,
  SITE_NAME,
} from "@esposter/shared";

const DATABASE_NAME = SITE_NAME.toLowerCase();
const DATABASE_VERSION = 1;

let databasePromise: Promise<Database<IndexedDbDatabaseSchema>> | undefined;

export const openIndexedDb = () => {
  if (databasePromise) return databasePromise;
  const promise = openDatabase<IndexedDbDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (database) => {
      const configurations = [
        MemberIndexedDbStoreConfiguration,
        MessageIndexedDbStoreConfiguration,
        RoomIndexedDbStoreConfiguration,
      ];
      for (const { indexName, keyPath, storeName } of configurations) {
        const objectStore = database.createObjectStore(storeName, { keyPath });
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

// The database is deleted by name whether or not this page has opened it: a page load that never opened it holds
// No connection, and the rows an earlier page load wrote are still there to be served to the next reader
export const resetIndexedDb = async () => {
  const database = await databasePromise;
  if (database) database.close();
  databasePromise = undefined;
  const deleteRequest = indexedDB.deleteDatabase(DATABASE_NAME);
  await new Promise<void>((resolve, reject) => {
    deleteRequest.onsuccess = () => {
      resolve();
    };
    deleteRequest.onerror = () => {
      reject(
        deleteRequest.error ??
          new InvalidOperationError(Operation.Delete, indexedDB.deleteDatabase.name, DATABASE_NAME),
      );
    };
    deleteRequest.onblocked = () => {
      resolve();
    };
  });
};
