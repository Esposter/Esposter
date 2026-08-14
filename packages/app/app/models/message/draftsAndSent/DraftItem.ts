import type { Draft } from "@/models/message/Draft";
import type { RoomInMessage } from "@esposter/db-schema";

export interface DraftItem extends Draft {
  room: RoomInMessage;
  // The thread this draft replies into, empty for a draft of the room's own message
  threadRootRowKey: string;
}
