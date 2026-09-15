import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import type { ItemEntityType } from "@esposter/shared";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType, MAX_TIMEOUT_DURATION_MS } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface TimeoutUserAdminActionInput
  extends BaseExecuteAdminActionInput, ItemEntityType<AdminActionType.TimeoutUser> {
  durationMs: number;
}

export const timeoutUserAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  ...createItemEntityTypeSchema(z.literal(AdminActionType.TimeoutUser)).shape,
  durationMs: z.int().positive().max(MAX_TIMEOUT_DURATION_MS),
}) satisfies z.ZodType<TimeoutUserAdminActionInput>;
