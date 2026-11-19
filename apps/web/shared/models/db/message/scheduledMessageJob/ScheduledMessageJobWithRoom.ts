import type { RoomInMessage, ScheduledMessageJobType } from "@esposter/db-schema";

// A row of the Scheduled tab: a reminder or a scheduled message, with the room it is in. The room is given only while the
// Person is still a member of it, so a reminder in a room they have left carries no room
export interface ScheduledMessageJobWithRoom {
  id: string;
  payload: ScheduledMessageJobPayload;
  room?: RoomInMessage | undefined;
  roomId: string;
  runAt: Date;
}

// What a scheduled item does, and the fields that kind carries: a reminder's text, or a scheduled message's body and the
// Message it replies to. Discriminated by `type`
type ScheduledMessageJobPayload =
  | { message: string; replyToId: null | number; type: typeof ScheduledMessageJobType.ScheduledMessage }
  | { text: string; type: typeof ScheduledMessageJobType.Reminder };
