import { AdminActionType, roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

const baseExecuteAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserSchema.shape.id,
});

export const executeAdminActionInputSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    durationMs: z.int().positive(),
    type: z.literal(AdminActionType.TimeoutUser),
  }),
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    type: z.literal(AdminActionType.SoftBan),
  }),
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    reason: z
      .string()
      .optional()
      .transform((v) => normalizeString(v) || undefined),
    type: z.literal(AdminActionType.Warn),
  }),
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    type: z.enum([
      AdminActionType.CreateBan,
      AdminActionType.ForceMute,
      AdminActionType.ForceUnmute,
      AdminActionType.KickFromRoom,
      AdminActionType.KickFromCall,
      AdminActionType.StopScreenShare,
    ]),
  }),
]);
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
