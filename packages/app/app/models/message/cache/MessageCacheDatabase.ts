import type { MessageEntity } from "@esposter/db-schema";
import type { DBSchema } from "idb";

import { MESSAGE_PARTITION_KEY_INDEX, MESSAGE_STORE_NAME } from "@/services/message/cache/constants";

export interface MessageCacheDatabase extends DBSchema {
  [MESSAGE_STORE_NAME]: {
    indexes: { [MESSAGE_PARTITION_KEY_INDEX]: string };
    key: [string, string];
    value: MessageEntity;
  };
}
