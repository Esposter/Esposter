import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { z } from "zod";

export const votePollInputSchema = z.object({
  // "" withdraws the caller's vote — the radio group emits no selection rather than an option id
  optionId: z.union([z.literal(""), z.uuid()]),
  ...messageCompositeKeySchema.shape,
});
export type VotePollInput = z.infer<typeof votePollInputSchema>;
