import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { z } from "zod";

export const votePollInputSchema = z.object({
  // "" withdraws the caller's vote — the radio group emits no selection rather than an option id
  optionId: z.union([z.literal(""), z.uuidv7()]),
  ...messageIdentityInputSchema.shape,
});
export type VotePollInput = z.infer<typeof votePollInputSchema>;
