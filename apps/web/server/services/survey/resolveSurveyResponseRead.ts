import type { Context } from "#server/trpc/context";
import type { ResourceInResource, SurveyResponseEntity } from "@esposter/db-schema";

import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "#server/services/survey/SurveyResponseModeValidatorMap";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";

// The read counterpart of resolveSurveyResponseWrite: a resume resolves the same identity a write would,
// So an Identified response is only ever readable by its own token and a shared browser cannot reopen
// Another recipient's answers. Unlike a write, a closed survey still reads — the respondent page renders
// The closed state, and the write boundary is what rejects the late submission. A recycle-binned survey reads
// Nothing in either mode, as it accepts nothing: its participant links died with the delete
export const resolveSurveyResponseRead = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
  participantToken: SurveyResponseEntity["participantToken"],
): Promise<SurveyResponseEntity["participantToken"]> => {
  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);

  const { responseMode } = await readSurveySettings(surveyId);
  return SurveyResponseModeValidatorMap[responseMode](db, surveyId, participantToken);
};
