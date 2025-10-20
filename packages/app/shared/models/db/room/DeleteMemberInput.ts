import { selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteMemberInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
});
export type DeleteMemberInput = z.infer<typeof deleteMemberInputSchema>;
