import type { z } from "zod";

import { standardMessageEntitySchema } from "@esposter/db-schema";

export const updateMessageInputSchema = standardMessageEntitySchema.pick({
  message: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
