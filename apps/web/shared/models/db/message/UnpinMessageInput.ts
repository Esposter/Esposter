import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { z } from "zod";

export const unpinMessageInputSchema = z.object({ ...messageIdentityInputSchema.shape });
export type UnpinMessageInput = z.infer<typeof unpinMessageInputSchema>;
