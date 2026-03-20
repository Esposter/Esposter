import type { MessageEntity } from "@esposter/db-schema";

import {
  MESSAGE_CACHE_LIMIT,
  MESSAGE_PARTITION_KEY_INDEX,
  MESSAGE_STORE_NAME,
} from "@/services/message/cache/constants";
import { openMessageCacheDatabase } from "@/services/message/cache/openMessageCacheDatabase";

export const writeCachedMessages = async (roomId: string, messages: MessageEntity[]) => {
  try {
    const database = await openMessageCacheDatabase();
    const transaction = database.transaction(MESSAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const index = store.index(MESSAGE_PARTITION_KEY_INDEX);
    const existingKeys = await index.getAllKeys(roomId);
    for (const key of existingKeys) await store.delete(key);
    const messagesToCache = messages.filter((message) => !message.isLoading).slice(0, MESSAGE_CACHE_LIMIT);
    for (const message of messagesToCache) await store.put(message);
    await transaction.done;
  } catch {
    // Best-effort cache
  }
};
