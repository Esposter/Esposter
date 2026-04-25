import { roomIdSchema, selectRoomRoleSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  color: selectRoomRoleSchema.shape.color.optional(),
  name: selectRoomRoleSchema.shape.name,
  permissions: selectRoomRoleSchema.shape.permissions.optional().default(0n),
  position: selectRoomRoleSchema.shape.position.optional().default(0),
});
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;
