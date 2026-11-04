import type { SurveyAnswerValue } from "headless-survey-engine";

// The text an answer holds, or the empty text when it holds none, so an input nobody has answered reads as empty
export const getSurveyAnswerText = (value: SurveyAnswerValue | undefined) => (typeof value === "string" ? value : "");
