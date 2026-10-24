import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";

import { NO_SURVEY_ID } from "#shared/services/pageBuilder/constants";

// The props a freshly inserted survey invite holds, under the id the caller mints for it, which every kind that places one shares
export const createSurveyInviteProps = (id: string): SurveyInviteNodeProps => ({
  id,
  label: "Survey",
  surveyId: NO_SURVEY_ID,
});
