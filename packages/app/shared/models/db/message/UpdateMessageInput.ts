import type { z } from "zod";

import { baseMessageEntitySchema } from "@esposter/db-schema";

export const updateMessageInputSchema = baseMessageEntitySchema.pick({
  message: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
