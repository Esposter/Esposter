import { callSessionIdSchema, sessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const setHandRaisedInputSchema = z.object({
  ...callSessionIdSchema.shape,
  isHandRaised: z.boolean(),
  // A participant is addressed by their session id, like the knocker they were admitted as
  participantId: sessionIdSchema.shape.sessionId,
});
export type SetHandRaisedInput = z.infer<typeof setHandRaisedInputSchema>;
