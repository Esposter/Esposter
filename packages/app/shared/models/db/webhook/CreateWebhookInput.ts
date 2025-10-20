import type { z } from "zod";

import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";

export const createWebhookInputSchema = selectWebhookSchema.pick({ name: true }).extend({
  roomId: selectRoomSchema.shape.id,
});
export type CreateWebhookInput = z.infer<typeof createWebhookInputSchema>;
