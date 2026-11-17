import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";
import type { Except } from "type-fest";

import { NO_SURVEY_ID } from "#shared/services/pageBuilder/constants";

// The props a freshly inserted survey invite holds, under the id the caller mints for it, which every kind that places one
// Shares. The element id is the webpage's alone, since an email's elements are not linked to, so the webpage adds it
export const createSurveyInviteProps = (id: string): Except<SurveyInviteNodeProps, "elementId"> => ({
  id,
  label: "Survey",
  surveyId: NO_SURVEY_ID,
});
