import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexedDbStoreSchema } from "@/models/cache/indexedDb/IndexedDbStoreSchema";
import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";
import type { DatabaseSchema } from "@esposter/shared";

export interface IndexedDbDatabaseSchema extends DatabaseSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<MemberInRoom>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<MessageEntity>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<RoomInMessage>;
}
