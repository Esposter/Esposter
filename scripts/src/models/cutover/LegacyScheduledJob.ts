import { ScheduledMessageJobType } from "@esposter/db-schema";
import { z } from "zod";

// A pending row of the old estate's `message.scheduledMessageJobs`: a message to send into its room, or a reminder for its
// Owner, each at `runAt`. A scheduled message names the thread it goes into by the root's row key, empty for the room itself
export const legacyScheduledJobSchema = z.object({
  id: z.uuid(),
  payload: z.discriminatedUnion("type", [
    z.object({ text: z.string(), type: z.literal(ScheduledMessageJobType.Reminder) }),
    z.object({
      message: z.string(),
      replyRowKey: z.string(),
      type: z.literal(ScheduledMessageJobType.ScheduledMessage),
    }),
  ]),
  roomId: z.uuid(),
  runAt: z.date(),
  userId: z.string(),
});
export type LegacyScheduledJob = z.infer<typeof legacyScheduledJobSchema>;
