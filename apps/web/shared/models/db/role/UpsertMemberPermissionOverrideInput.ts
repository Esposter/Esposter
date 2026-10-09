import { roomIdSchema, selectRoomRoleInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// Each bitfield names the permissions a write puts into one state. A bit in none of them is left as it was, and a
// Bit in `inherit` is returned to the roles
const permissionBitsSchema = selectRoomRoleInMessageSchema.shape.permissions.default(0n);

export const upsertMemberPermissionOverrideInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
  allow: permissionBitsSchema,
  deny: permissionBitsSchema,
  inherit: permissionBitsSchema,
});
export type UpsertMemberPermissionOverrideInput = z.infer<typeof upsertMemberPermissionOverrideInputSchema>;
