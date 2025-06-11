import type { Survey } from "#shared/db/schema/surveys";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";

export const parseSurveyModel = (surveyModel: Survey["model"]): Record<string, unknown> =>
  surveyModel ? jsonDateParse(surveyModel) : {};
