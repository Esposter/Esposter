import type { MessageCacheDatabase } from "@/models/message/cache/MessageCacheDatabase";
import type { IDBPDatabase } from "idb";

import { MESSAGE_STORE_NAME } from "@/services/message/cache/constants";
import { openDB } from "idb";

const DB_NAME = "esposter-message-cache";
const DB_VERSION = 1;

let database: IDBPDatabase<MessageCacheDatabase> | undefined;

export const openMessageCacheDatabase = async () => {
  if (database) return database;
  database = await openDB<MessageCacheDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: ["partitionKey", "rowKey"] });
      store.createIndex("partitionKey", "partitionKey");
    },
  });
  return database;
};
