import { selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const getMemberRolesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
});
export type GetMemberRolesInput = z.infer<typeof getMemberRolesInputSchema>;
