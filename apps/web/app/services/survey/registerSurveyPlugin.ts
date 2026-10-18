import type { App } from "vue";

import "survey-core/survey-core.min.css";
import "survey-core/survey.i18n";
import { surveyPlugin } from "survey-vue3-ui";

// The runner's components register globally with the survey's own chunk rather than at startup; `app.use` installs a plugin once, so every mount may call it
export const registerSurveyPlugin = (vueApp: App): void => {
  vueApp.use(surveyPlugin);
};
