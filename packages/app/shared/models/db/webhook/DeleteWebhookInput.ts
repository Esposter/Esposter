import { roomIdSchema, selectWebhookSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteWebhookInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectWebhookSchema.pick({ id: true }).shape,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
