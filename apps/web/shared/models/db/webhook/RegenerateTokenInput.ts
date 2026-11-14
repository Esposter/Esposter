import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const regenerateTokenInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectWebhookInMessageSchema.pick({ id: true }).shape,
});
export type RegenerateTokenInput = z.infer<typeof regenerateTokenInputSchema>;
