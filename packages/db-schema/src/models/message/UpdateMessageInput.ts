import { messageCompositeKeySchema } from "#src/models/message/MessageCompositeKey";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { z } from "zod";

export const updateMessageInputSchema = z.object({
  ...messageCompositeKeySchema.shape,
  message: standardMessageEntitySchema.shape.message,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
