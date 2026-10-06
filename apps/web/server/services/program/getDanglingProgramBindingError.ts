import type { TRPCError } from "@trpc/server";

import { DANGLING_PROGRAM_BINDING_REASON } from "#server/services/program/constants";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Unset, deleted, and key-column-missing all land here, for the audience and the survey alike — from the owner's
// Side they are the same problem with the same fix: rebind it on the Setup blade
export const getDanglingProgramBindingError = (): TRPCError =>
  getInvalidOperationError(Operation.Create, AzureEntityType.ProgramParticipant, DANGLING_PROGRAM_BINDING_REASON);
