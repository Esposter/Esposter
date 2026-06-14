import { roomIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteDirectMessageParticipantInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
});
export type DeleteDirectMessageParticipantInput = z.infer<typeof deleteDirectMessageParticipantInputSchema>;
