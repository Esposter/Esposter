import type { RoomInMessage, ScheduledMessageJobInMessage } from "@esposter/db-schema";

export interface ScheduledMessageJobWithRoom extends ScheduledMessageJobInMessage {
  room: RoomInMessage;
}
