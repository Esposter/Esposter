import type { MessageEntity } from "@esposter/db-schema";

import { MESSAGE_PARTITION_KEY_INDEX, MESSAGE_STORE_NAME } from "@/services/message/cache/constants";
import { openMessageCacheDatabase } from "@/services/message/cache/openMessageCacheDatabase";

export const readCachedMessages = async (roomId: string): Promise<MessageEntity[]> => {
  try {
    const database = await openMessageCacheDatabase();
    return await database.getAllFromIndex(MESSAGE_STORE_NAME, MESSAGE_PARTITION_KEY_INDEX, roomId);
  } catch {
    return [];
  }
};
