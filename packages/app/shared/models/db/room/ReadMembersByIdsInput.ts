import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMembersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: userIdsSchema.shape.userIds.min(1),
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;
