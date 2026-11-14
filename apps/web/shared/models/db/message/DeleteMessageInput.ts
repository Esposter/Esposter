import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { z } from "zod";

export const deleteMessageInputSchema = z.object({ ...messageIdentityInputSchema.shape });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
