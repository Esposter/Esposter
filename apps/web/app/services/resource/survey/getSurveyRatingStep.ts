import type { SurveyAnswerValue } from "vue-survey-engine-headless";

// The step a rating answer holds, or the empty text when it holds none, since no step has the empty text as its value
export const getSurveyRatingStep = (value: SurveyAnswerValue | undefined) => (typeof value === "number" ? value : "");
