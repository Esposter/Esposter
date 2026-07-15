import { invalidInviteTokenErrorReason } from "@@/server/services/survey/constants";
import { AzureEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// One error for every Invited-mode rejection — missing, forged, and another survey's token are
// Deliberately indistinguishable, so the response is never an oracle for probing valid tokens
export const invalidInviteTokenError = (): TRPCError =>
  new TRPCError({
    code: "FORBIDDEN",
    message: new InvalidOperationError(Operation.Create, AzureEntityType.SurveyResponse, invalidInviteTokenErrorReason)
      .message,
  });
