import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";
import { z } from "zod";

export const rotateTokenInputSchema = z.object({
  ...selectWebhookSchema.pick({ id: true }).shape,
  roomId: selectRoomSchema.shape.id,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
