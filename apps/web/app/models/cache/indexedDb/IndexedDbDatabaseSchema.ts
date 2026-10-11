import type { DatabaseSchema, ItemMetadata } from "@esposter/shared";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { CompositeKey } from "@esposter/azure";
import type { MessageEntity, PublicUser, RoomInMessage } from "@esposter/db-schema";

export interface IndexedDbDatabaseSchema extends DatabaseSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<PublicUser>;
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
