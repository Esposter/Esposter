import { roomIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createDirectMessageParticipantInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
});
export type CreateDirectMessageParticipantInput = z.infer<typeof createDirectMessageParticipantInputSchema>;
