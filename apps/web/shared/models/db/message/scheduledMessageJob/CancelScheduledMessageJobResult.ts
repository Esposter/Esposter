import type { ScheduledMessageJobType, ScheduledReminder, ScheduledRoomMessage } from "@esposter/db-schema";

// What a cancel left as a tombstone, tagged by the kind of job it cancelled: a reminder's row, or a scheduled message's
export type CancelScheduledMessageJobResult =
  | { kind: typeof ScheduledMessageJobType.Reminder; row: ScheduledReminder }
  | { kind: typeof ScheduledMessageJobType.ScheduledMessage; row: ScheduledRoomMessage };
