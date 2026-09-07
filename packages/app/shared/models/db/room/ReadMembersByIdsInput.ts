import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMembersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;
