import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookSchema } from "@esposter/db-schema";

export const rotateTokenInputSchema = selectWebhookSchema.pick({ id: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
