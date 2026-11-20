import type { MemberRowInRoom } from "#shared/models/db/room/MemberRowInRoom";
import type { IndexedDbStoreName } from "#src/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexedDbStoreSchema } from "#src/models/cache/indexedDb/IndexedDbStoreSchema";
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";
import type { DatabaseSchema } from "@esposter/shared";

export interface IndexedDbDatabaseSchema extends DatabaseSchema {
  [IndexedDbStoreName.Members]: IndexedDbStoreSchema<MemberRowInRoom>;
  [IndexedDbStoreName.Messages]: IndexedDbStoreSchema<ClientMessage>;
  [IndexedDbStoreName.Rooms]: IndexedDbStoreSchema<RoomInMessage>;
  [IndexedDbStoreName.UserToRooms]: IndexedDbStoreSchema<UserToRoomInMessage>;
}
