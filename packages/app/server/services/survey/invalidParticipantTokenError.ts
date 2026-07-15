import { invalidParticipantTokenErrorReason } from "@@/server/services/survey/constants";
import { AzureEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// One error for every Identified-mode rejection — missing, forged, and another survey's token are
// Deliberately indistinguishable, so the response is never an oracle for probing valid tokens
export const invalidParticipantTokenError = (): TRPCError =>
  new TRPCError({
    code: "FORBIDDEN",
    message: new InvalidOperationError(
      Operation.Create,
      AzureEntityType.SurveyResponse,
      invalidParticipantTokenErrorReason,
    ).message,
  });
