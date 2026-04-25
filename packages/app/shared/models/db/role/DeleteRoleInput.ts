import { roomIdSchema, selectRoomRoleSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteRoleInputSchema = z.object({
  ...roomIdSchema.shape,
  id: selectRoomRoleSchema.shape.id,
});
export type DeleteRoleInput = z.infer<typeof deleteRoleInputSchema>;
