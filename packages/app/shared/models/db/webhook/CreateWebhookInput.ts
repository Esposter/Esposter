import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createWebhookInputSchema = z.object({
  ...selectWebhookSchema.pick({ name: true }).shape,
  roomId: selectRoomSchema.shape.id,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
