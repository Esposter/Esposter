import type { RoomInMessage, User } from "@esposter/db-schema";

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

export type ExecuteAdminActionInput =
  | TimeoutUserAdminActionInput
  | UnparameterizedAdminActionInput
  | WarnAdminActionInput;

export interface TimeoutUserAdminActionInput extends BaseExecuteAdminActionInput {
  durationMs: number;
  readonly type: AdminActionType.TimeoutUser;
}

export interface UnparameterizedAdminActionInput extends BaseExecuteAdminActionInput {
  readonly type:
    | AdminActionType.CreateBan
    | AdminActionType.ForceMute
    | AdminActionType.ForceUnmute
    | AdminActionType.KickFromCall
    | AdminActionType.KickFromRoom
    | AdminActionType.SoftBan
    | AdminActionType.StopScreenShare;
}

export interface WarnAdminActionInput extends BaseExecuteAdminActionInput {
  reason?: string;
  readonly type: AdminActionType.Warn;
}

interface BaseExecuteAdminActionInput {
  roomId: RoomInMessage["id"];
  targetUserId: User["id"];
}

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
]) satisfies z.ZodType<ExecuteAdminActionInput>;
