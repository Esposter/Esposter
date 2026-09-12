import type { TimeoutUserAdminActionInput } from "#shared/models/db/moderation/TimeoutUserAdminActionInput";
import type { UnparameterizedAdminActionInput } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import type { WarnAdminActionInput } from "#shared/models/db/moderation/WarnAdminActionInput";

import { timeoutUserAdminActionInputSchema } from "#shared/models/db/moderation/TimeoutUserAdminActionInput";
import { unparameterizedAdminActionInputSchema } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import { warnAdminActionInputSchema } from "#shared/models/db/moderation/WarnAdminActionInput";
import { z } from "zod";

export type ExecuteAdminActionInput =
  | TimeoutUserAdminActionInput
  | UnparameterizedAdminActionInput
  | WarnAdminActionInput;

export const executeAdminActionInputSchema = z.discriminatedUnion("type", [
  timeoutUserAdminActionInputSchema,
  warnAdminActionInputSchema,
  unparameterizedAdminActionInputSchema,
]) satisfies z.ZodType<ExecuteAdminActionInput>;
