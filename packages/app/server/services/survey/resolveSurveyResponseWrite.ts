import type { Context } from "@@/server/trpc/context";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { closedSurveyErrorReason } from "@@/server/services/survey/constants";
import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "@@/server/services/survey/SurveyResponseModeValidatorMap";
import { AzureEntityType, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The single write boundary for both response mutations — client state can never bypass it.
// Costs one blob read per submission; submissions are rate-limited and low-volume, so no caching until measured
export const resolveSurveyResponseWrite = async (
  db: Context["db"],
  surveyId: Resource["id"],
  participantToken: SurveyResponseEntity["participantToken"],
): Promise<SurveyResponseEntity["participantToken"]> => {
  // A survey in the Recycle bin must not keep collecting responses — deleting it kills the
  // Participant links immediately, even though the row and blob survive for restore
  const survey = await db.query.resources.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw new TRPCError({ code: "NOT_FOUND" });

  const { isAcceptingResponses, responseMode } = await readSurveySettings(surveyId);
  if (!isAcceptingResponses)
    throw new TRPCError({
      code: "CONFLICT",
      message: new InvalidOperationError(Operation.Create, AzureEntityType.SurveyResponse, closedSurveyErrorReason)
        .message,
    });
  return SurveyResponseModeValidatorMap[responseMode](db, surveyId, participantToken);
};
