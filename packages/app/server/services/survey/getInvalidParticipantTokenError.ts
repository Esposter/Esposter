import type { TRPCError } from "@trpc/server";

import { INVALID_PARTICIPANT_TOKEN_ERROR_REASON } from "@@/server/services/survey/constants";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// One error for every Identified-mode rejection — missing, forged, and another survey's token are
// Deliberately indistinguishable, so the response is never an oracle for probing valid tokens
export const getInvalidParticipantTokenError = (): TRPCError =>
  getInvalidOperationError(
    Operation.Create,
    AzureEntityType.SurveyResponse,
    INVALID_PARTICIPANT_TOKEN_ERROR_REASON,
    "FORBIDDEN",
  );
