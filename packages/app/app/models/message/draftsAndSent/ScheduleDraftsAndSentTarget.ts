import type { RoomInMessage, ScheduledMessageJobInMessage } from "@esposter/db-schema";

export interface ScheduleDraftsAndSentTarget {
  content: string;
  roomId: RoomInMessage["id"];
  scheduledMessageJobId?: ScheduledMessageJobInMessage["id"];
  // The thread the message is scheduled into, empty for the room itself — a thread draft scheduled for later
  // Still lands in its own thread
  threadRootRowKey: string;
}
