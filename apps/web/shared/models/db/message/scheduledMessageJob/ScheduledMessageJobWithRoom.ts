import type { RoomInMessage, ScheduledMessageJobType } from "@esposter/db-schema";

// A row of the Scheduled tab: a reminder or a scheduled message, with the room it is in
export interface ScheduledMessageJobWithRoom {
  id: string;
  payload: ScheduledMessageJobPayload;
  room: RoomInMessage;
  roomId: string;
  runAt: Date;
  // The version of the row the item was read from, the reminder's or the scheduled message's, so the client holds it at
  // That version
  version: number;
}

// What a scheduled item does, and the fields that kind carries: a reminder's text, or a scheduled message's body and
// The Message it replies to. Discriminated by `type`
type ScheduledMessageJobPayload =
  | { message: string; replyToId: null | number; type: typeof ScheduledMessageJobType.ScheduledMessage }
  | { text: string; type: typeof ScheduledMessageJobType.Reminder };
