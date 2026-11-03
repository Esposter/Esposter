import type { Context } from "#server/trpc/context";
import type { CreateSurveyResponseInput } from "#shared/models/db/survey/CreateSurveyResponseInput";
import type { ResourceInResource, SurveyResponseEntity } from "@esposter/db-schema";

import { readSnapshotVersionContent } from "#server/services/resource/snapshot/readSnapshotVersionContent";
import { CLOSED_SURVEY_ERROR_REASON } from "#server/services/survey/constants";
import { readLiveSurvey } from "#server/services/survey/readLiveSurvey";
import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "#server/services/survey/SurveyResponseModeValidatorMap";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { AzureEntityType, DatabaseEntityType, SnapshotChannel } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { SurveyAnswerValidationMode, validateSurveyAnswers } from "survey-engine";

// The single write boundary for both response mutations — client state can never bypass it.
// Costs two blob reads per submission, the live settings and the published snapshot it is checked against; submissions are
// Rate-limited and low-volume, so no caching until measured
export const resolveSurveyResponseWrite = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
  participantToken: SurveyResponseEntity["participantToken"],
  { isDraft, model }: Pick<CreateSurveyResponseInput, "isDraft" | "model">,
): Promise<SurveyResponseEntity["participantToken"]> => {
  const survey = await readLiveSurvey(db, surveyId);

  const { isAcceptingResponses, responseMode } = await readSurveySettings(surveyId);
  if (!isAcceptingResponses)
    throw getInvalidOperationError(
      Operation.Create,
      AzureEntityType.SurveyResponse,
      CLOSED_SURVEY_ERROR_REASON,
      "CONFLICT",
    );

  const resolvedParticipantToken = await SurveyResponseModeValidatorMap[responseMode](db, surveyId, participantToken);
  // A respondent answers the page they were served, so a republish since then does not refuse their draft
  if (!survey.publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, surveyId);
  const publishedContent = await readSnapshotVersionContent(db, survey, {
    channel: SnapshotChannel.Published,
    version: survey.publication.publishVersion,
  });
  if (publishedContent === undefined) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);

  const [issue] = validateSurveyAnswers(
    surveyResourceSchema.parse(publishedContent).document,
    model,
    isDraft ? SurveyAnswerValidationMode.Draft : SurveyAnswerValidationMode.Submit,
    new Date(),
  );
  if (issue)
    throw getInvalidOperationError(
      Operation.Create,
      AzureEntityType.SurveyResponse,
      `Answer to "${issue.name}": ${issue.message}`,
    );
  return resolvedParticipantToken;
};
