import { selectScheduledMessageJobInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const cancelScheduledMessageJobInputSchema = z.object({
  id: selectScheduledMessageJobInMessageSchema.shape.id,
});
export type CancelScheduledMessageJobInput = z.infer<typeof cancelScheduledMessageJobInputSchema>;
