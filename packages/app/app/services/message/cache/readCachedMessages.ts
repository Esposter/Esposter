import type { MessageEntity } from "@esposter/db-schema";

import { MESSAGE_CACHE_LIMIT, MESSAGE_STORE_NAME } from "@/services/message/cache/constants";
import { openMessageCacheDatabase } from "@/services/message/cache/openMessageCacheDatabase";

export const readCachedMessages = async (roomId: string): Promise<MessageEntity[]> => {
  try {
    const database = await openMessageCacheDatabase();
    const messages = await database.getAllFromIndex(MESSAGE_STORE_NAME, "partitionKey", roomId);
    // Messages are stored with reverse-ticked rowKey, sort ascending (most recent = smallest rowKey first)
    messages.sort((a, b) => a.rowKey.localeCompare(b.rowKey));
    return messages.slice(0, MESSAGE_CACHE_LIMIT);
  } catch {
    return [];
  }
};
