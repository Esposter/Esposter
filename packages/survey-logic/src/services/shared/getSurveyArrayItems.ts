import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The items of an array value: a list's elements, or a matrix's values keyed by row. Anything else holds no items
export const getSurveyArrayItems = (data: SurveyLogicValue): SurveyLogicValue[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) return Object.values(data);

  return [];
};
