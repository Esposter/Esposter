import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readNicknamesInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
export type ReadNicknamesInput = z.infer<typeof readNicknamesInputSchema>;
