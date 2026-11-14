import type { BaseExecuteAdminActionInput } from "#src/models/message/BaseExecuteAdminActionInput";
import type { ItemEntityType } from "@esposter/shared";

import { AdminActionType } from "#src/models/message/AdminActionType";
import { baseExecuteAdminActionInputSchema } from "#src/models/message/BaseExecuteAdminActionInput";
import { MAX_TIMEOUT_DURATION_MS } from "#src/services/message/constants";
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
