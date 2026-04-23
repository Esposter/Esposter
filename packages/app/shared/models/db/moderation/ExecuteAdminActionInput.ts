import { adminActionTypeSchema, roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const executeAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  durationMs: z.int().positive().optional(),
  targetUserId: selectUserSchema.shape.id,
  type: adminActionTypeSchema,
});
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
