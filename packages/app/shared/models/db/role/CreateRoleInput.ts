import { selectRoomRoleSchema, selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createRoleInputSchema = z.object({
  color: selectRoomRoleSchema.shape.color.optional(),
  name: selectRoomRoleSchema.shape.name,
  permissions: selectRoomRoleSchema.shape.permissions.optional().default(0n),
  position: selectRoomRoleSchema.shape.position.optional().default(0),
  roomId: selectRoomSchema.shape.id,
});
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;
