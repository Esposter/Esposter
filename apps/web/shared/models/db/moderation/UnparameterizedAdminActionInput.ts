import type { BaseExecuteAdminActionInput } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import type { UnparameterizedAdminActionType } from "#shared/models/db/moderation/UnparameterizedAdminActionType";
import type { ItemEntityType } from "@esposter/shared";

import { baseExecuteAdminActionInputSchema } from "#shared/models/db/moderation/BaseExecuteAdminActionInput";
import { UnparameterizedAdminActionTypes } from "#shared/models/db/moderation/UnparameterizedAdminActionType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface UnparameterizedAdminActionInput
  extends BaseExecuteAdminActionInput, ItemEntityType<UnparameterizedAdminActionType> {}

export const unparameterizedAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  ...createItemEntityTypeSchema(z.enum(UnparameterizedAdminActionTypes)).shape,
}) satisfies z.ZodType<UnparameterizedAdminActionInput>;
