import type { RoomInMessage, ScheduledMessageJobInMessage } from "@esposter/db-schema";

export interface ScheduledMessageJobInMessageWithRoom extends ScheduledMessageJobInMessage {
  room: RoomInMessage;
}
