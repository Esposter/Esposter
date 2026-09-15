import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import type { ItemEntityType } from "@esposter/shared";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType, MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";
import { createItemEntityTypeSchema, createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

export interface WarnAdminActionInput extends BaseExecuteAdminActionInput, ItemEntityType<AdminActionType.Warn> {
  reason?: string;
}

export const warnAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  ...createItemEntityTypeSchema(z.literal(AdminActionType.Warn)).shape,
  reason: createNormalizedStringSchema(MODERATION_NOTE_MAX_LENGTH)
    .optional()
    .transform((value) => value || undefined),
}) satisfies z.ZodType<WarnAdminActionInput>;
