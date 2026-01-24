import type { z } from "zod";

import { selectRoomInMessageSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";

export const rotateTokenInputSchema = selectWebhookInMessageSchema.pick({ id: true }).extend({
  roomId: selectRoomInMessageSchema.shape.id,
});
export type RotateTokenInput = z.infer<typeof rotateTokenInputSchema>;
