import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectRoomRoleSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoleInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    color: selectRoomRoleSchema.shape.color.optional(),
    id: selectRoomRoleSchema.shape.id,
    name: selectRoomRoleSchema.shape.name.optional(),
    permissions: selectRoomRoleSchema.shape.permissions.optional(),
    position: selectRoomRoleSchema.shape.position.optional(),
  }),
  ["color", "name", "permissions", "position"],
);
export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
