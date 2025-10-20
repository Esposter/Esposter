import type { z } from "zod";

import { standardMessageEntitySchema } from "@esposter/db-schema";

export const deleteMessageInputSchema = standardMessageEntitySchema.pick({
  partitionKey: true,
  rowKey: true,
});
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
