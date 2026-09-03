import type { TRPCError } from "@trpc/server";

import { DANGLING_PROGRAM_BINDING_REASON } from "@@/server/services/program/constants";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Unset, deleted, and key-column-missing all land here — from the owner's side they are the same
// Problem with the same fix: rebind the audience on the Setup blade
export const getDanglingProgramBindingError = (): TRPCError =>
  getInvalidOperationError(Operation.Create, AzureEntityType.ProgramParticipant, DANGLING_PROGRAM_BINDING_REASON);
