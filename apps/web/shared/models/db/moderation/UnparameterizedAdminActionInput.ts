import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType } from "@esposter/db-schema";
import { z } from "zod";

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

export const unparameterizedAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  type: z.enum([
    AdminActionType.CreateBan,
    AdminActionType.ForceMute,
    AdminActionType.ForceUnmute,
    AdminActionType.KickFromCall,
    AdminActionType.KickFromRoom,
    AdminActionType.SoftBan,
    AdminActionType.StopScreenShare,
  ]),
}) satisfies z.ZodType<UnparameterizedAdminActionInput>;
