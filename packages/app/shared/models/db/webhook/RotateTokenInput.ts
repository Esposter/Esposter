import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const rotateTokenInputSchema = z.object({
  ...selectWebhookInMessageSchema.pick({ id: true }).shape,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
