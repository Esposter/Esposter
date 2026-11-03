import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { roundSurveyLogicResult } from "#src/services/shared/roundSurveyLogicResult";

// A product keeps the digits of both operands added together
export const roundSurveyLogicProduct = (left: SurveyLogicValue, right: SurveyLogicValue, product: number): number =>
  roundSurveyLogicResult(product, countSurveyLogicDecimals(left) + countSurveyLogicDecimals(right));
