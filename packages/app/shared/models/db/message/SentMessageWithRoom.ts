import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

export interface SentMessageWithRoom {
  message: MessageEntity;
  room: RoomInMessage;
}
