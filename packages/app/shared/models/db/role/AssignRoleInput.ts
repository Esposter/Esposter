import { selectRoomRoleSchema, selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const assignRoleInputSchema = z.object({
  roleId: selectRoomRoleSchema.shape.id,
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
});
export type AssignRoleInput = z.infer<typeof assignRoleInputSchema>;
