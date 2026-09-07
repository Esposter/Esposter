import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteWebhookInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectWebhookInMessageSchema.pick({ id: true }).shape,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
