import { roomIdSchema, selectRoomRoleInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const assignRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
  roleId: selectRoomRoleInMessageSchema.shape.id,
});
export type AssignRoleInput = z.infer<typeof assignRoleInputSchema>;
