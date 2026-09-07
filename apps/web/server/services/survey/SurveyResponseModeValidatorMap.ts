import type { SurveyResponseModeValidator } from "@@/server/models/survey/SurveyResponseModeValidator";

import { resolveIdentifiedToken } from "@@/server/services/survey/resolveIdentifiedToken";
import { SurveyResponseMode } from "@esposter/db-schema";

export const SurveyResponseModeValidatorMap: Record<SurveyResponseMode, SurveyResponseModeValidator> = {
  // A stale participant link into a now-anonymous survey still works, it just carries nothing
  [SurveyResponseMode.Anonymous]: () => Promise.resolve(""),
  [SurveyResponseMode.Identified]: resolveIdentifiedToken,
};
