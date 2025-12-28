import type { z } from "zod";

import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";

export const deleteWebhookInputSchema = selectWebhookSchema.pick({ id: true }).extend({
  roomId: selectRoomSchema.shape.id,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
