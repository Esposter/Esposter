import type { z } from "zod";

import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";

export const rotateTokenInputSchema = selectWebhookSchema.pick({ id: true }).extend({
  roomId: selectRoomSchema.shape.id,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
