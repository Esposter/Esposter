import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { addSurveyLogicValues } from "#src/services/shared/addSurveyLogicValues";
import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { roundSurveyLogicResult } from "#src/services/shared/roundSurveyLogicResult";

// The total of the values from zero, with unanswered values, lists and records skipped. A total is trimmed to the most
// Decimal places either side has, as SurveyJS trims it. Once it has become text while it has decimals it is empty, since
// SurveyJS fails on that
export const sumSurveyValues = (values: SurveyLogicValue[]): SurveyLogicValue => {
  let total: SurveyLogicValue = 0;
  for (const value of values) {
    if (value === undefined || typeof value === "object") continue;

    const sum = addSurveyLogicValues(total, value);
    const decimals = Math.max(countSurveyLogicDecimals(total), countSurveyLogicDecimals(value));
    if (decimals === 0) total = sum;
    else if (typeof sum === "number") total = roundSurveyLogicResult(sum, decimals);
    else return undefined;
  }

  return total;
};
