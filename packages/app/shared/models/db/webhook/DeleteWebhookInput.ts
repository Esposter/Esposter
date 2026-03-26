import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteWebhookInputSchema = z.object({
  ...selectWebhookSchema.pick({ id: true }).shape,
  roomId: selectRoomSchema.shape.id,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
