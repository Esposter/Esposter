import type { TimeoutUserAdminActionInput } from "#shared/models/db/moderation/TimeoutUserAdminActionInput";
import type { UnparameterizedAdminActionInput } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";

import { timeoutUserAdminActionInputSchema } from "#shared/models/db/moderation/TimeoutUserAdminActionInput";
import { unparameterizedAdminActionInputSchema } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import { z } from "zod";

export type ExecuteAdminActionInput = TimeoutUserAdminActionInput | UnparameterizedAdminActionInput;

export const executeAdminActionInputSchema = z.discriminatedUnion("type", [
  timeoutUserAdminActionInputSchema,
  unparameterizedAdminActionInputSchema,
]) satisfies z.ZodType<ExecuteAdminActionInput>;
