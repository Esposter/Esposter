import type { MessageCacheDatabase } from "@/models/message/cache/MessageCacheDatabase";
import type { IDBPDatabase } from "idb";

import {
  MESSAGE_CACHE_DATABASE_NAME,
  MESSAGE_CACHE_DATABASE_VERSION,
  MESSAGE_PARTITION_KEY_INDEX,
  MESSAGE_STORE_NAME,
} from "@/services/message/cache/constants";
import { openDB } from "idb";

let database: IDBPDatabase<MessageCacheDatabase> | undefined;

export const openMessageCacheDatabase = async () => {
  if (database) return database;
  database = await openDB<MessageCacheDatabase>(MESSAGE_CACHE_DATABASE_NAME, MESSAGE_CACHE_DATABASE_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: ["partitionKey", "rowKey"] });
      store.createIndex(MESSAGE_PARTITION_KEY_INDEX, MESSAGE_PARTITION_KEY_INDEX);
    },
  });
  return database;
};
