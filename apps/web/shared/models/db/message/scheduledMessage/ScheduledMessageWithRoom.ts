import type { RoomInMessage, ScheduledRoomMessage } from "@esposter/db-schema";

export interface ScheduledMessageWithRoom extends ScheduledRoomMessage {
  room: RoomInMessage;
  roomId: string;
}
