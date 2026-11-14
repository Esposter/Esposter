import { roomIdSchema, roomReactionSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readReactionsInputSchema = z.object({
  ...roomIdSchema.shape,
  messageIds: createUniqueArraySchema(roomReactionSchema.shape.messageId).min(1).max(MAX_READ_LIMIT),
});
export type ReadReactionsInput = z.infer<typeof readReactionsInputSchema>;
