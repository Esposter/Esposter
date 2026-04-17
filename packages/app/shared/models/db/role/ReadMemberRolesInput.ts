import { selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMemberRolesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
});
export type ReadMemberRolesInput = z.infer<typeof readMemberRolesInputSchema>;
