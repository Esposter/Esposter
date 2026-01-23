import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookSchema } from "@esposter/db-schema";

export const deleteWebhookInputSchema = selectWebhookSchema.pick({ id: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
