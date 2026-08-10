import { roomIdSchema, selectRoomRoleInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  color: selectRoomRoleInMessageSchema.shape.color.optional(),
  name: selectRoomRoleInMessageSchema.shape.name,
  permissions: selectRoomRoleInMessageSchema.shape.permissions.default(0n),
  position: selectRoomRoleInMessageSchema.shape.position.default(0),
});
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;
