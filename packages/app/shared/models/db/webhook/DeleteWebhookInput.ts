import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";

export const deleteWebhookInputSchema = selectWebhookInMessageSchema.pick({ id: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type DeleteWebhookInput = z.infer<typeof deleteWebhookInputSchema>;
