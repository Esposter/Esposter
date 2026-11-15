import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexedDbStoreSchema } from "#src/models/cache/indexedDb/IndexedDbStoreSchema";
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";
import type { DatabaseSchema } from "@esposter/shared";

export interface IndexedDbDatabaseSchema extends DatabaseSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<MemberInRoom>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<ClientMessage>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<RoomInMessage>;
}
