import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { roundSurveyLogicResult } from "#src/services/shared/roundSurveyLogicResult";

// A product keeps the digits of both operands added together
export const roundSurveyLogicProduct = (left: number, right: number, product: number): number =>
  roundSurveyLogicResult(product, countSurveyLogicDecimals(left) + countSurveyLogicDecimals(right));
