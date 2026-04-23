import { AdminActionType, adminActionTypeSchema, roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const executeAdminActionInputSchema = z
  .object({
    ...roomIdSchema.shape,
    durationMs: z.int().positive().optional(),
    targetUserId: selectUserSchema.shape.id,
    type: adminActionTypeSchema,
  })
  .superRefine(({ durationMs, type }, ctx) => {
    if (type !== AdminActionType.TimeoutUser || durationMs !== undefined) return;
    ctx.addIssue({
      code: "custom",
      message: "durationMs is required for timeout actions",
      path: ["durationMs"],
    });
  });
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
