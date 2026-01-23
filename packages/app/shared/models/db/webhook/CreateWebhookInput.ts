import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookSchema } from "@esposter/db-schema";

export const createWebhookInputSchema = selectWebhookSchema.pick({ name: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
