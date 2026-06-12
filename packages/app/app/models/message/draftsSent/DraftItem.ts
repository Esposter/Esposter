import type { Draft } from "@/models/message/Draft";
import type { RoomInMessage } from "@esposter/db-schema";

export interface DraftItem extends Draft {
  room: RoomInMessage;
}
