import { adminActionTypeSchema, selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const executeAdminActionInputSchema = z.object({
  durationMs: z.int().positive().optional(),
  roomId: selectRoomSchema.shape.id,
  targetUserId: selectUserSchema.shape.id,
  type: adminActionTypeSchema,
});
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
