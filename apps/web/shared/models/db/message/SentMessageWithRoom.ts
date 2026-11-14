import type { RoomInMessage, RoomMessage } from "@esposter/db-schema";

export interface SentMessageWithRoom {
  message: RoomMessage;
  room: RoomInMessage;
}
