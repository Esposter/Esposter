import type { Context } from "#server/trpc/context";
import type { CreateSurveyResponseInput } from "#shared/models/db/survey/CreateSurveyResponseInput";
import type { ResourceInResource, SurveyResponseInResource } from "@esposter/db-schema";

import { readSnapshotVersionContent } from "#server/services/resource/snapshot/readSnapshotVersionContent";
import { CLOSED_SURVEY_ERROR_REASON } from "#server/services/survey/constants";
import { readLiveSurvey } from "#server/services/survey/readLiveSurvey";
import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "#server/services/survey/SurveyResponseModeValidatorMap";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { DatabaseEntityType, ResourceType, SnapshotChannel } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { SurveyAnswerValidationMode, validateSurveyAnswers } from "vue-survey-engine-headless";

// The single write boundary for both response mutations — client state can never bypass it.
// Costs two blob reads per submission, the live settings and the published snapshot it is checked against; submissions are
// Rate-limited and low-volume, so no caching until measured
export const resolveSurveyResponseWrite = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
  participantToken: SurveyResponseInResource["participantToken"],
  { isDraft, model }: Pick<CreateSurveyResponseInput, "isDraft" | "model">,
): Promise<SurveyResponseInResource["participantToken"]> => {
  const survey = await readLiveSurvey(db, surveyId);

  const { isAcceptingResponses, responseMode } = await readSurveySettings(surveyId);
  if (!isAcceptingResponses)
    throw getInvalidOperationError(
      Operation.Create,
      DatabaseEntityType.SurveyResponse,
      CLOSED_SURVEY_ERROR_REASON,
      "CONFLICT",
    );

  const resolvedParticipantToken = await SurveyResponseModeValidatorMap[responseMode](db, surveyId, participantToken);
  // The write is checked against the publication a respondent is served now, not the working copy the owner may have edited since
  if (!survey.publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, surveyId);
  const publishedContent = await readSnapshotVersionContent(
    db,
    { id: survey.id, type: ResourceType.Survey },
    { channel: SnapshotChannel.Published, version: survey.publication.publishVersion },
  );
  if (publishedContent === undefined) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);

  const [issue] = validateSurveyAnswers(
    publishedContent.document,
    model,
    isDraft ? SurveyAnswerValidationMode.Draft : SurveyAnswerValidationMode.Submit,
    new Date(),
  );
  if (issue)
    throw getInvalidOperationError(
      Operation.Create,
      DatabaseEntityType.SurveyResponse,
      `Answer to "${issue.name}": ${issue.message}`,
    );
  return resolvedParticipantToken;
};
