import type { SurveyRootProps } from "vue-survey-engine-headless";

// A root prop typed as a plain string, which "" clears: a text, a picture's url or a colour; a literal union such as showProgressBar's is not one
export type SurveyRootStringPropName = {
  [K in keyof SurveyRootProps]: string extends SurveyRootProps[K] ? K : never;
}[keyof SurveyRootProps];
