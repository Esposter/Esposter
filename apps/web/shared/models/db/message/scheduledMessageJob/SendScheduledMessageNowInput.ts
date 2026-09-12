import { selectScheduledMessageJobInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const sendScheduledMessageNowInputSchema = z.object({
  id: selectScheduledMessageJobInMessageSchema.shape.id,
});
export type SendScheduledMessageNowInput = z.infer<typeof sendScheduledMessageNowInputSchema>;
