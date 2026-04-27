import { roomIdSchema, selectRoomRoleInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const revokeRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
  roleId: selectRoomRoleInMessageSchema.shape.id,
});
export type RevokeRoleInput = z.infer<typeof revokeRoleInputSchema>;
