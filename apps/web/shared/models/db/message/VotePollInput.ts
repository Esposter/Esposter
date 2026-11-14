import { messageCompositeKeySchema } from "@esposter/db-schema";
import { z } from "zod";

export const votePollInputSchema = z.object({
  // "" withdraws the caller's vote — the radio group emits no selection rather than an option id
  optionId: z.union([z.literal(""), z.uuidv4()]),
  ...messageCompositeKeySchema.shape,
});
export type VotePollInput = z.infer<typeof votePollInputSchema>;
