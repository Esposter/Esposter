import type { Survey } from "@esposter/db";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";

export const parseSurveyModel = (surveyModel: Survey["model"]): Record<string, unknown> =>
  surveyModel ? jsonDateParse(surveyModel) : {};
