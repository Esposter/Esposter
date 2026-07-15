import type { Context } from "@@/server/trpc/context";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";
import { SurveyResponseModeValidatorMap } from "@@/server/services/survey/SurveyResponseModeValidatorMap";

// The read counterpart of resolveSurveyResponseWrite: a resume resolves the same identity a write would,
// So an Invited response is only ever readable by its own token and a shared browser cannot reopen
// Another recipient's answers. Unlike a write, a closed survey still reads — the respondent page renders
// The closed state, and the write boundary is what rejects the late submission
export const resolveSurveyResponseRead = async (
  db: Context["db"],
  surveyId: Resource["id"],
  inviteToken: SurveyResponseEntity["inviteToken"],
): Promise<SurveyResponseEntity["inviteToken"]> => {
  const { responseMode } = await readSurveySettings(surveyId);
  return SurveyResponseModeValidatorMap[responseMode](db, surveyId, inviteToken);
};
