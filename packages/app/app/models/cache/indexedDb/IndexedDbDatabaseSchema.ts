import type { CompositeKey, MessageEntity, Room, User } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";
import type { DBSchema } from "idb";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export interface IndexedDbDatabaseSchema extends DBSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<User>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<MessageEntity>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<Room>;
}

interface IndexedDbStoreSchema<T extends CompositeKey | ItemMetadata> {
  indexes: Record<string, string>;
  key: [string, string] | string;
  value: T;
}
