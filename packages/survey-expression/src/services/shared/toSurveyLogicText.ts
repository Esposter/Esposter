import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The text a value reads as where a text is needed.
// A list joins its items with a comma, as JavaScript's join does, and an unanswered value reads as nothing.
// A record holds no text of its own, so it reads as nothing too
export const toSurveyLogicText = (value: SurveyLogicValue): string => {
  if (value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => toSurveyLogicText(item)).join(",");
  if (typeof value === "object") return "";

  return String(value);
};
