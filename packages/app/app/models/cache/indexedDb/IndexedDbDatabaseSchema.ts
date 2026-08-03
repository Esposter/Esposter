import type { CompositeKey, MessageEntity, RoomInMessage, User } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";
import type { DBSchema } from "idb";

import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";

export interface IndexedDbDatabaseSchema extends DBSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<User>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<MessageEntity>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<RoomInMessage>;
}

interface IndexedDbStoreSchema<TItem extends CompositeKey | ItemMetadata> {
  // Index keys are strings so a partition doubles as a `useMutation` target verbatim — a wider `IDBValidKey`
  // Would have to be stringified to become one, and `String()` collapses distinct keys (`"1,2"` and `[1, 2]`)
  // Onto a single target
  indexes: Record<string, string>;
  key: IDBValidKey;
  value: TItem;
}
