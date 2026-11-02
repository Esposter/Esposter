import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readUsersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
export type ReadUsersByIdsInput = z.infer<typeof readUsersByIdsInputSchema>;
