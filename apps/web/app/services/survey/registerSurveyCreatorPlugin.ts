import type { App } from "vue";

import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/survey-creator-core.min.css";
import SurveyTheme from "survey-core/themes";
import { registerSurveyTheme } from "survey-creator-core";
import { surveyCreatorPlugin } from "survey-creator-vue";

import { registerSurveyPlugin } from "@/services/survey/registerSurveyPlugin";

// The plugin registers SurveyCreatorComponent first, so a mount after the first finds it and registers neither the
// Plugin nor the page-wide theme registry's themes again
export const registerSurveyCreatorPlugin = (vueApp: App): void => {
  registerSurveyPlugin(vueApp);
  if (vueApp.component("SurveyCreatorComponent")) return;
  vueApp.use(surveyCreatorPlugin);
  registerSurveyTheme(SurveyTheme);
};
