import { selectRoomRoleSchema, selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoleInputSchema = z.object({
  color: selectRoomRoleSchema.shape.color.optional(),
  id: selectRoomRoleSchema.shape.id,
  name: selectRoomRoleSchema.shape.name.optional(),
  permissions: selectRoomRoleSchema.shape.permissions.optional(),
  position: selectRoomRoleSchema.shape.position.optional(),
  roomId: selectRoomSchema.shape.id,
});
export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
