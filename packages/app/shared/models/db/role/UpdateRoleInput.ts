import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectRoomRoleInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoleInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    color: selectRoomRoleInMessageSchema.shape.color.optional(),
    id: selectRoomRoleInMessageSchema.shape.id,
    name: selectRoomRoleInMessageSchema.shape.name.optional(),
    permissions: selectRoomRoleInMessageSchema.shape.permissions.optional(),
    position: selectRoomRoleInMessageSchema.shape.position.optional(),
  }),
  ["color", "name", "permissions", "position"],
);
export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
