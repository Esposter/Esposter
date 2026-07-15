import type { SurveyResponseModeValidator } from "@@/server/models/survey/SurveyResponseModeValidator";

import { resolveInvitedToken } from "@@/server/services/survey/resolveInvitedToken";
import { SurveyResponseMode } from "@esposter/db-schema";

export const SurveyResponseModeValidatorMap: Record<SurveyResponseMode, SurveyResponseModeValidator> = {
  // A stale invite link into a now-anonymous survey still works, it just carries nothing
  [SurveyResponseMode.Anonymous]: () => Promise.resolve(""),
  [SurveyResponseMode.Invited]: resolveInvitedToken,
};
