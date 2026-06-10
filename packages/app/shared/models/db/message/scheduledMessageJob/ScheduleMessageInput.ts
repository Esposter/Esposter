import {
  roomIdSchema,
  scheduledMessageScheduledMessageJobPayloadSchema,
  selectScheduledMessageJobInMessageSchema,
} from "@esposter/db-schema";
import { z } from "zod";

export const scheduleMessageInputSchema = z.object({
  ...roomIdSchema.shape,
  message: scheduledMessageScheduledMessageJobPayloadSchema.shape.message,
  runAt: selectScheduledMessageJobInMessageSchema.shape.runAt,
});
export type ScheduleMessageInput = z.infer<typeof scheduleMessageInputSchema>;
