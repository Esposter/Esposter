import type { TimeoutUserAdminActionInput } from "@esposter/db-schema";
import type { UnparameterizedAdminActionInput } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import { timeoutUserAdminActionInputSchema } from "@esposter/db-schema";
import { unparameterizedAdminActionInputSchema } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import { z } from "zod";

export type ExecuteAdminActionInput = TimeoutUserAdminActionInput | UnparameterizedAdminActionInput;

export const executeAdminActionInputSchema = z.discriminatedUnion("type", [
  timeoutUserAdminActionInputSchema,
  unparameterizedAdminActionInputSchema,
]) satisfies z.ZodType<ExecuteAdminActionInput>;
