import { callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const setHandRaisedInputSchema = z.object({
  ...callSessionIdSchema.shape,
  isHandRaised: z.boolean(),
  participantId: z.string(),
});
export type SetHandRaisedInput = z.infer<typeof setHandRaisedInputSchema>;
