import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexedDbStoreSchema } from "@/models/cache/indexedDb/IndexedDbStoreSchema";
import type { MessageInMessage, RoomInMessage } from "@esposter/db-schema";
import type { DatabaseSchema } from "@esposter/shared";

export interface IndexedDbDatabaseSchema extends DatabaseSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<MemberInRoom>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<MessageInMessage>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<RoomInMessage>;
}
