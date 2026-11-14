import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readMessagesByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  messageIds: createUniqueArraySchema(roomMessageSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
export type ReadMessagesByIdsInput = z.infer<typeof readMessagesByIdsInputSchema>;
