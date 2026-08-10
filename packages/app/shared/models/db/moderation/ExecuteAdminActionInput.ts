import {
  AdminActionType,
  MAX_TIMEOUT_DURATION_MS,
  MODERATION_NOTE_MAX_LENGTH,
  roomIdSchema,
  selectUserSchema,
} from "@esposter/db-schema";
import { createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

const baseExecuteAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserSchema.shape.id,
});

export const executeAdminActionInputSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    durationMs: z.int().positive().max(MAX_TIMEOUT_DURATION_MS),
    type: z.literal(AdminActionType.TimeoutUser),
  }),
  z.object({
    ...baseExecuteAdminActionInputSchema.shape,
    // Bounded by the moderation note length: both are the same moderator-authored free text, and a warn
    // Reason with no bound at all is an unbounded string a member of the room can hand the server
    reason: createNormalizedStringSchema(MODERATION_NOTE_MAX_LENGTH)
      .optional()
      .transform((value) => value || undefined),
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
      AdminActionType.SoftBan,
      AdminActionType.StopScreenShare,
    ]),
  }),
]);
export type ExecuteAdminActionInput = z.infer<typeof executeAdminActionInputSchema>;
