import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { convertSurveyLogicOperand } from "#src/services/evaluator/operators/convertSurveyLogicOperand";

// The right operand converts against the left after it has converted, as SurveyJS converts them in that order
export const convertSurveyLogicOperands = (
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): [SurveyLogicValue, SurveyLogicValue] => {
  const convertedLeft = convertSurveyLogicOperand(left, right);

  return [convertedLeft, convertSurveyLogicOperand(right, convertedLeft)];
};
