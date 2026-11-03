import type { SurveyConditionValue } from "@/models/resource/survey/SurveyConditionValue";

// A decimal is held as a number only when writing that number back gives the text typed, so a point or a leading zero
// Typed part way stays text the reader can keep typing
const SURVEY_NUMBER_REGEX = /^-?\d+(?:\.\d+)?$/u;

export const toSurveyConditionInputValue = (text: string): SurveyConditionValue =>
  SURVEY_NUMBER_REGEX.test(text) && String(Number(text)) === text ? Number(text) : text;
