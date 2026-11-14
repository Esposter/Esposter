import type { MessageInMessage, RoomInMessage } from "@esposter/db-schema";

export interface SentMessageWithRoom {
  message: MessageInMessage;
  room: RoomInMessage;
}
