import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { sanitizedMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateMessageInputSchema = z.object({
  ...messageIdentityInputSchema.shape,
  message: sanitizedMessageSchema,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
