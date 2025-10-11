import type { z } from "zod";

import { baseMessageEntitySchema } from "@esposter/db-schema";

export const deleteMessageInputSchema = baseMessageEntitySchema.pick({
  partitionKey: true,
  rowKey: true,
});
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
