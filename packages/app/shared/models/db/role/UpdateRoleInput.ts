import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectRoomRoleInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableRoleSchema = selectRoomRoleInMessageSchema.pick({
  color: true,
  name: true,
  permissions: true,
  position: true,
});

export const updateRoleInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...updatableRoleSchema.partial().shape,
    id: selectRoomRoleInMessageSchema.shape.id,
  }),
  updatableRoleSchema.keyof().options,
);
export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
