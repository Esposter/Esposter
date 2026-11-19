import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createSurveyDocument } from "vue-survey-engine-headless";

// The survey a new one starts from, before its first save: an empty document under the settings a parse of nothing gives
export const createEmptySurvey = (): SurveyResource => ({
  document: createSurveyDocument(),
  settings: surveySettingsSchema.parse({}),
});
