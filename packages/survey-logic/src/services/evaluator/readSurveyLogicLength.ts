import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The length a `length` tail reads: a list's items or a text's characters, and zero for any other value
export const readSurveyLogicLength = (value: SurveyLogicValue): number =>
  Array.isArray(value) || typeof value === "string" ? value.length : 0;
