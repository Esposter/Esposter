import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateMessageInputSchema = z.object({
  ...messageCompositeKeySchema.shape,
  message: standardMessageEntitySchema.shape.message,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
