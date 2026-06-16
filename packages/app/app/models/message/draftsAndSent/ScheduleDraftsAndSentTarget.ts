import type { RoomInMessage, ScheduledMessageJobInMessage } from "@esposter/db-schema";

export interface ScheduleDraftsAndSentTarget {
  content: string;
  roomId: RoomInMessage["id"];
  scheduledMessageJobId?: ScheduledMessageJobInMessage["id"];
}
