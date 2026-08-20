import type { Draft } from "@/models/message/Draft";
import type { RoomInMessage } from "@esposter/db-schema";

export interface DraftItem extends Draft {
  // The composer this draft belongs to, which is what identifies it — a room holds one draft of its own message
  // And one per thread open in it, so the room alone names several
  composerKey: string;
  room: RoomInMessage;
  // The thread this draft replies into, empty for a draft of the room's own message
  threadRootRowKey: string;
}
