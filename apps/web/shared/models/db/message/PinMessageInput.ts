import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { z } from "zod";

export const pinMessageInputSchema = z.object({ ...messageIdentityInputSchema.shape });
export type PinMessageInput = z.infer<typeof pinMessageInputSchema>;
