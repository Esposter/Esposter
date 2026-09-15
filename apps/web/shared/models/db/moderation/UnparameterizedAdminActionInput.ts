import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import type { ItemEntityType } from "@esposter/shared";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface UnparameterizedAdminActionInput
  extends
    BaseExecuteAdminActionInput,
    ItemEntityType<
      | AdminActionType.CreateBan
      | AdminActionType.ForceMute
      | AdminActionType.ForceUnmute
      | AdminActionType.KickFromCall
      | AdminActionType.KickFromRoom
      | AdminActionType.SoftBan
      | AdminActionType.StopScreenShare
    > {}

export const unparameterizedAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  ...createItemEntityTypeSchema(
    z.enum([
      AdminActionType.CreateBan,
      AdminActionType.ForceMute,
      AdminActionType.ForceUnmute,
      AdminActionType.KickFromCall,
      AdminActionType.KickFromRoom,
      AdminActionType.SoftBan,
      AdminActionType.StopScreenShare,
    ]),
  ).shape,
}) satisfies z.ZodType<UnparameterizedAdminActionInput>;
