import type { App } from "vue";

import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/survey-creator-core.min.css";
import SurveyTheme from "survey-core/themes";
import { registerSurveyTheme } from "survey-creator-core";
import { surveyCreatorPlugin } from "survey-creator-vue";

import { registerSurveyPlugin } from "@/services/survey/registerSurveyPlugin";

// The creator's theme registry is global to the page, so the theme registers once however many mounts call this
let isThemeRegistered = false;

export const registerSurveyCreatorPlugin = (vueApp: App): void => {
  registerSurveyPlugin(vueApp);
  vueApp.use(surveyCreatorPlugin);
  if (isThemeRegistered) return;

  isThemeRegistered = true;
  registerSurveyTheme(SurveyTheme);
};
