import { roomIdSchema, selectRoomRoleInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  id: selectRoomRoleInMessageSchema.shape.id,
});
export type DeleteRoleInput = z.infer<typeof deleteRoleInputSchema>;
