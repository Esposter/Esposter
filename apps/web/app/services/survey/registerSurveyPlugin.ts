import type { App } from "vue";

import "survey-core/survey-core.min.css";
import "survey-core/survey.i18n";
import { surveyPlugin } from "survey-vue3-ui";

// The runner's components register with the survey's own chunk rather than at startup. The plugin registers
// SurveyComponent first, so a mount after the first finds it and installs nothing, which Vue would warn about
export const registerSurveyPlugin = (vueApp: App): void => {
  if (vueApp.component("SurveyComponent")) return;
  vueApp.use(surveyPlugin);
};
