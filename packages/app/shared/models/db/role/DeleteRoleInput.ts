import { selectRoomRoleSchema, selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteRoleInputSchema = z.object({
  id: selectRoomRoleSchema.shape.id,
  roomId: selectRoomSchema.shape.id,
});
export type DeleteRoleInput = z.infer<typeof deleteRoleInputSchema>;
