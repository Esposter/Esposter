import { roomIdSchema } from "#src/models/shared/RoomId";
import { userIdSchema } from "#src/models/shared/UserId";
import { selectRoomRoleInMessageSchema } from "#src/schema/message/roomRolesInMessage";
import { z } from "zod";

export const revokeRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
  roleId: selectRoomRoleInMessageSchema.shape.id,
});
export type RevokeRoleInput = z.infer<typeof revokeRoleInputSchema>;
