import "survey-core/survey-core.min.css";
import "survey-core/survey.i18n";
import SurveyTheme from "survey-core/themes";
import { registerSurveyTheme } from "survey-creator-core";
import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/survey-creator-core.min.css";
import { surveyCreatorPlugin } from "survey-creator-vue";
import { surveyPlugin } from "survey-vue3-ui";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(surveyPlugin).use(surveyCreatorPlugin);
  registerSurveyTheme(SurveyTheme);
});
