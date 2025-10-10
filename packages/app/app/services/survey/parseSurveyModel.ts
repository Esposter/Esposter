import type { Survey } from "@esposter/db-schema";

import { jsonDateParse } from "@esposter/shared";

export const parseSurveyModel = (surveyModel: Survey["model"]): Record<string, unknown> =>
  surveyModel ? jsonDateParse(surveyModel) : {};
