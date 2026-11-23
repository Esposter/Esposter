import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { ToData } from "@esposter/shared";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createSurveyDocument } from "vue-survey-engine-headless";

// The survey a new one starts from, before its first save: an empty document under the settings a parse of nothing
// Gives. It is the stored data, so its settings are the parsed plain object and not the settings class
export const createEmptySurvey = (): ToData<SurveyResource> => ({
  document: createSurveyDocument(),
  settings: surveySettingsSchema.parse({}),
});
