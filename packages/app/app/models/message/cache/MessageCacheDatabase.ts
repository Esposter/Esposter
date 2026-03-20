import type { MessageEntity } from "@esposter/db-schema";
import type { DBSchema } from "idb";

import { MESSAGE_STORE_NAME } from "@/services/message/cache/constants";

export interface MessageCacheDatabase extends DBSchema {
  [MESSAGE_STORE_NAME]: {
    indexes: { partitionKey: string };
    key: [string, string];
    value: MessageEntity;
  };
}
