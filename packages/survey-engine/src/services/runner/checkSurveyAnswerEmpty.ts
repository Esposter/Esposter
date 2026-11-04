import { normalizeString } from "@esposter/shared";

// An answer a required question refuses is one with nothing in it: absent, text that is empty once trimmed or an empty list. A yes or no and a zero are answers
export const checkSurveyAnswerEmpty = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === "string" && normalizeString(value) === "") ||
  (Array.isArray(value) && value.length === 0);
