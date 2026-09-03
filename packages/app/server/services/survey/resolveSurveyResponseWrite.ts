import type { Context } from "@@/server/trpc/context";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { CLOSED_SURVEY_ERROR_REASON } from "@@/server/services/survey/constants";
import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "@@/server/services/survey/SurveyResponseModeValidatorMap";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { AzureEntityType, DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

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
  if (!survey) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);

  const { isAcceptingResponses, responseMode } = await readSurveySettings(surveyId);
  if (!isAcceptingResponses)
    throw getInvalidOperationError(
      Operation.Create,
      AzureEntityType.SurveyResponse,
      CLOSED_SURVEY_ERROR_REASON,
      "CONFLICT",
    );
  return SurveyResponseModeValidatorMap[responseMode](db, surveyId, participantToken);
};
