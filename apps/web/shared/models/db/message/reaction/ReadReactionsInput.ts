import { roomIdSchema, roomReactionSchema } from "@esposter/db-schema";
import { createIdBatchSchema } from "@esposter/shared";
import { z } from "zod";

export const readReactionsInputSchema = z.object({
  ...roomIdSchema.shape,
  messageIds: createIdBatchSchema(roomReactionSchema.shape.messageId),
});
export type ReadReactionsInput = z.infer<typeof readReactionsInputSchema>;
