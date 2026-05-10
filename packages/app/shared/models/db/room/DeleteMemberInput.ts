import { roomIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteMemberInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
});
export type DeleteMemberInput = z.infer<typeof deleteMemberInputSchema>;
