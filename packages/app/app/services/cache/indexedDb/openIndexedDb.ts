import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IDBPDatabase } from "idb";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { getResultAsync } from "@esposter/shared";
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
    await getResultAsync(() => promise)
      .orTee(() => {
        if (databasePromise === promise) databasePromise = undefined;
      })
      .unwrapOr(undefined);
  })();
  databasePromise = promise;
  return databasePromise;
};

export const resetIndexedDb = async () => {
  const db = await databasePromise;
  db?.close();
  databasePromise = undefined;
};
