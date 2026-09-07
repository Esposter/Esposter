import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createWebhookInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectWebhookInMessageSchema.pick({ name: true }).shape,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
