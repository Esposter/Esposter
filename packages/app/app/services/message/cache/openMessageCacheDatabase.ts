import type { MessageCacheDatabase } from "@/models/message/cache/MessageCacheDatabase";
import type { IDBPDatabase } from "idb";

import {
  MESSAGE_CACHE_DATABASE_NAME,
  MESSAGE_CACHE_DATABASE_VERSION,
  MESSAGE_PARTITION_KEY_INDEX,
  MESSAGE_STORE_NAME,
} from "@/services/message/cache/constants";
import { openDB } from "idb";

let databasePromise: Promise<IDBPDatabase<MessageCacheDatabase>> | undefined;

export const openMessageCacheDatabase = () => {
  if (databasePromise) return databasePromise;
  databasePromise = openDB<MessageCacheDatabase>(MESSAGE_CACHE_DATABASE_NAME, MESSAGE_CACHE_DATABASE_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: ["partitionKey", "rowKey"] });
      store.createIndex(MESSAGE_PARTITION_KEY_INDEX, MESSAGE_PARTITION_KEY_INDEX);
    },
  });
  return databasePromise;
};

export const resetMessageCacheDatabase = async () => {
  if (databasePromise) {
    const database = await databasePromise;
    database.close();
    databasePromise = undefined;
  }
};
