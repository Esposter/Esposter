import type { SurveyRootProps } from "vue-survey-engine-headless";

// A root prop whose value is a string, which "" clears: a text, a picture's url or a colour
export type SurveyRootStringPropName = {
  [K in keyof SurveyRootProps]: SurveyRootProps[K] extends string ? K : never;
}[keyof SurveyRootProps];
