import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { roundSurveyLogicResult } from "#src/services/shared/roundSurveyLogicResult";

// A sum or difference keeps the digits of the operand that has the most
export const roundSurveyLogicSum = (left: number, right: number, sum: number): number =>
  roundSurveyLogicResult(sum, Math.max(countSurveyLogicDecimals(left), countSurveyLogicDecimals(right)));
