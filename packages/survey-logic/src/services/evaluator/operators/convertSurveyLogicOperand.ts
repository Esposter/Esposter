import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// An empty operand reads as zero, or as the empty text or list the other operand asks for.
// So an unanswered question adds as zero and joins as nothing
export const convertSurveyLogicOperand = (operand: SurveyLogicValue, other: SurveyLogicValue): SurveyLogicValue => {
  if (!checkIsSurveyLogicValueEmpty(operand)) return operand;
  if (typeof other === "number") return 0;
  if (typeof operand === "string") return operand;
  if (typeof other === "string") return "";
  if (Array.isArray(other)) return [];

  return 0;
};
