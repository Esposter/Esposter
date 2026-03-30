import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteWebhookInputSchema = z.object({
  ...selectWebhookInMessageSchema.pick({ id: true }).shape,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
