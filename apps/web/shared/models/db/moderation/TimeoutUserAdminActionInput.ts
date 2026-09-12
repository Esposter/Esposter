import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { AdminActionType, MAX_TIMEOUT_DURATION_MS } from "@esposter/db-schema";
import { z } from "zod";

export interface TimeoutUserAdminActionInput extends BaseExecuteAdminActionInput {
  durationMs: number;
  readonly type: AdminActionType.TimeoutUser;
}

export const timeoutUserAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  durationMs: z.int().positive().max(MAX_TIMEOUT_DURATION_MS),
  type: z.literal(AdminActionType.TimeoutUser),
}) satisfies z.ZodType<TimeoutUserAdminActionInput>;
