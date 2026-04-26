import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const rotateTokenInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectWebhookInMessageSchema.pick({ id: true }).shape,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
