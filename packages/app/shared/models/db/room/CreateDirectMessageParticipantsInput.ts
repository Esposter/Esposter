import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createDirectMessageParticipantsInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
export type CreateDirectMessageParticipantsInput = z.infer<typeof createDirectMessageParticipantsInputSchema>;
