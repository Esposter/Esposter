import { callParticipantSchema, callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const setHandRaisedInputSchema = z.object({
  ...callSessionIdSchema.shape,
  isHandRaised: z.boolean(),
  // A participant is addressed by the id the call names it by, which is the id its tile is keyed by
  participantId: callParticipantSchema.shape.id,
});
export type SetHandRaisedInput = z.infer<typeof setHandRaisedInputSchema>;
