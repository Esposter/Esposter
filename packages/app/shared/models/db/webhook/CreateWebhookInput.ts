import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createWebhookInputSchema = z.object({
  ...selectWebhookInMessageSchema.pick({ name: true }).shape,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
