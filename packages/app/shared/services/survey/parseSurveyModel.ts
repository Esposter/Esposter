import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";

import { jsonDateParse } from "@esposter/shared";

export const parseSurveyModel = (surveyModel: SurveyResource["model"]): Record<string, unknown> =>
  surveyModel ? jsonDateParse(surveyModel) : {};
