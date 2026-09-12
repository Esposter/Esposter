import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType, MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";
import { createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

export interface WarnAdminActionInput extends BaseExecuteAdminActionInput {
  reason?: string;
  readonly type: AdminActionType.Warn;
}

export const warnAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  reason: createNormalizedStringSchema(MODERATION_NOTE_MAX_LENGTH)
    .optional()
    .transform((value) => value || undefined),
  type: z.literal(AdminActionType.Warn),
}) satisfies z.ZodType<WarnAdminActionInput>;
