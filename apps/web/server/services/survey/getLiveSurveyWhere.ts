import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceType } from "@esposter/db-schema";

// A survey that is live: not in the Recycle bin, and of the survey type. Every read that resolves a survey to answer or
// Accept a response starts here, so a binned survey is gone to each of them, as it is to the respondent its links open
// On
export const getLiveSurveyWhere = (surveyId: ResourceInResource["id"]) => ({
  deletedAt: { isNull: true as const },
  id: { eq: surveyId },
  type: { eq: ResourceType.Survey },
});
