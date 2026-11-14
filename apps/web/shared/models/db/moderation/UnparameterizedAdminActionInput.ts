import type { UnparameterizedAdminActionType } from "#shared/models/db/moderation/UnparameterizedAdminActionType";
import type { BaseExecuteAdminActionInput } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";

import { UnparameterizedAdminActionTypes } from "#shared/models/db/moderation/UnparameterizedAdminActionType";
import { baseExecuteAdminActionInputSchema } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface UnparameterizedAdminActionInput
  extends BaseExecuteAdminActionInput, ItemEntityType<UnparameterizedAdminActionType> {}

export const unparameterizedAdminActionInputSchema = z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  ...createItemEntityTypeSchema(z.enum(UnparameterizedAdminActionTypes)).shape,
}) satisfies z.ZodType<UnparameterizedAdminActionInput>;
