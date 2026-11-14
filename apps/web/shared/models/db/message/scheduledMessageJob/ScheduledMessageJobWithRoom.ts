import type { RoomInMessage, ScheduledMessageJobType } from "@esposter/db-schema";

// What a scheduled item does, and the fields that kind carries: a reminder's text, or a scheduled message's body and the
// Message it replies to. Discriminated by `type`
export type ScheduledMessageJobPayload =
  | { message: string; replyToId: null | number; type: ScheduledMessageJobType.ScheduledMessage }
  | { text: string; type: ScheduledMessageJobType.Reminder };

// A row of the Scheduled tab: a reminder or a scheduled message, with the room it is in
export interface ScheduledMessageJobWithRoom {
  id: string;
  payload: ScheduledMessageJobPayload;
  room: RoomInMessage;
  roomId: string;
  runAt: Date;
}
