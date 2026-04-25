import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IDBPDatabase } from "idb";

import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { openDB } from "idb";

const DATABASE_NAME = "esposter";
const DATABASE_VERSION = 1;

let databasePromise: Promise<IDBPDatabase<IndexedDbDatabaseSchema>> | undefined;

export const openIndexedDb = async (): Promise<IDBPDatabase<IndexedDbDatabaseSchema>> => {
  if (databasePromise) return databasePromise;
  databasePromise = openDB<IndexedDbDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
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
  return databasePromise;
};

export const resetIndexedDb = async () => {
  const db = await databasePromise;
  db?.close();
  databasePromise = undefined;
};
