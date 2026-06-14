import type { RoomInMessage, ScheduledMessageJobInMessage } from "@esposter/db-schema";

export interface ScheduleDraftsSentTarget {
  content: string;
  roomId: RoomInMessage["id"];
  scheduledMessageJobId?: ScheduledMessageJobInMessage["id"];
}
