import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// Two values order only when both are answered, so an unanswered side is never less or greater than anything
export const checkIsSurveyLogicComparable = (left: SurveyLogicValue, right: SurveyLogicValue): boolean =>
  left !== null && left !== undefined && right !== null && right !== undefined;
