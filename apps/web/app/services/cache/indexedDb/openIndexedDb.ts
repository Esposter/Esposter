import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { Database } from "@esposter/shared";

import { RESET_DATABASE_TIMEOUT_MS } from "@/services/cache/constants";
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
  withFinalizerAsync,
} from "@esposter/shared";

export const DATABASE_NAME = SITE_NAME.toLowerCase();
export const DATABASE_VERSION = 1;

let databasePromise: Promise<Database<IndexedDbDatabaseSchema>> | undefined;

// Closes the connection this module holds and forgets it, so the next read or write opens a fresh one. A rejected open
// Holds no connection, and its failure was already logged where the open raised it
const releaseDatabase = async () => {
  const promise = databasePromise;
  databasePromise = undefined;
  if (!promise) return;
  await getResultAsync(() => promise).match((database) => {
    database.close();
  }, noop);
};

export const openIndexedDb = () => {
  if (databasePromise) return databasePromise;
  const promise = openDatabase<IndexedDbDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    // A delete or upgrade from another tab waits until this connection closes, so the connection gives way when asked.
    // The next read or write opens a fresh one, queued behind that request
    blocking: getSynchronizedFunction(releaseDatabase),
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
  // Another tab's open connection holds the delete back until it closes, and a tab from older code never closes it, so
  // The wait is bounded and an expired one fails the delete. The bound covers the release too, since this tab's own
  // Open can be queued behind that same delete and never settle
  const { promise: expiry, reject: expire } = Promise.withResolvers<never>();
  const expiryTimeout = setTimeout(() => {
    expire(new InvalidOperationError(Operation.Delete, DATABASE_NAME, "still blocked by another open connection"));
  }, RESET_DATABASE_TIMEOUT_MS);
  await withFinalizerAsync(
    async () => {
      await Promise.race([releaseDatabase(), expiry]);
      await Promise.race([deleteDatabase(), expiry]);
    },
    () => {
      clearTimeout(expiryTimeout);
    },
  );
};

const deleteDatabase = () =>
  new Promise<void>((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DATABASE_NAME);
    deleteRequest.onsuccess = () => {
      resolve();
    };
    deleteRequest.onerror = () => {
      reject(
        deleteRequest.error ??
          new InvalidOperationError(Operation.Delete, indexedDB.deleteDatabase.name, DATABASE_NAME),
      );
    };
  });
