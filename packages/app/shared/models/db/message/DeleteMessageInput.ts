import type { z } from "zod";

import { messageEntitySchema } from "@esposter/db";

export const deleteMessageInputSchema = messageEntitySchema.pick({
  partitionKey: true,
  rowKey: true,
});
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
