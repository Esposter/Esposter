import { danglingProgramBindingReason } from "@@/server/services/program/constants";
import { AzureEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Unset, deleted, and key-column-missing all land here — from the owner's side they are the same
// Problem with the same fix: rebind the audience on the Setup blade
export const danglingProgramBindingError = (): TRPCError =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: new InvalidOperationError(
      Operation.Create,
      AzureEntityType.ProgramParticipant,
      danglingProgramBindingReason,
    ).message,
  });
