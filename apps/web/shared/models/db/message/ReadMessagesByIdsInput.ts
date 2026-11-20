import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { createIdBatchSchema } from "@esposter/shared";
import { z } from "zod";

export const readMessagesByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  messageIds: createIdBatchSchema(roomMessageSchema.shape.id),
});
export type ReadMessagesByIdsInput = z.infer<typeof readMessagesByIdsInputSchema>;
