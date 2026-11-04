import { roundSurveyLogicSum } from "#src/services/shared/roundSurveyLogicSum";
import { toSurveyLogicResult } from "#src/services/shared/toSurveyLogicResult";

// The total of the numbers from zero.
// Each addition keeps the digits of its two operands, which removes the float noise of the binary sum.
// Undefined when the total overflows
export const sumSurveyNumbers = (numbers: number[]): number | undefined => {
  let total = 0;
  for (const number of numbers) total = roundSurveyLogicSum(total, number, total + number);

  return toSurveyLogicResult(total);
};
