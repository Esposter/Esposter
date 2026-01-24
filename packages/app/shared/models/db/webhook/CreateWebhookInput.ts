import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";

export const createWebhookInputSchema = selectWebhookInMessageSchema.pick({ name: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
