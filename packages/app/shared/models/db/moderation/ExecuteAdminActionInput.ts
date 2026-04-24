import { AdminActionType, roomIdSchema, selectUserSchema } from "@esposter/db-schema";
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
    type: z.enum([
      AdminActionType.CreateBan,
      AdminActionType.ForceMute,
      AdminActionType.ForceUnmute,
      AdminActionType.KickFromRoom,
      AdminActionType.KickFromVoice,
    ]),
  }),
]);
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
