import type { Context } from "#server/trpc/context";
import type { ResourceInResource, SurveyResponseEntity } from "@esposter/db-schema";

import { CLOSED_SURVEY_ERROR_REASON } from "#server/services/survey/constants";
import { readLiveSurvey } from "#server/services/survey/readLiveSurvey";
import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "#server/services/survey/SurveyResponseModeValidatorMap";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// The single write boundary for both response mutations — client state can never bypass it.
// Costs one blob read per submission; submissions are rate-limited and low-volume, so no caching until measured
export const resolveSurveyResponseWrite = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
  participantToken: SurveyResponseEntity["participantToken"],
): Promise<SurveyResponseEntity["participantToken"]> => {
  await readLiveSurvey(db, surveyId);

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
