import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyNumberWithPrecision } from "#src/services/shared/getSurveyNumberWithPrecision";
import { toSurveyLogicResult } from "#src/services/shared/toSurveyLogicResult";

// The number rounded to a number of decimal places, or to a whole number when the precision is empty
export const roundFunction: SurveyLogicFunction = (args) => {
  const numberWithPrecision = getSurveyNumberWithPrecision(args);
  if (numberWithPrecision === undefined) return undefined;

  const [number, precision] = numberWithPrecision;
  // The scaled value is nudged up by Number.EPSILON before Math.round, as SurveyJS does.
  // That nudge rounds a half away from zero, where Math.round alone would send -2.5 to -2.
  const scale = 10 ** precision;

  return toSurveyLogicResult(Math.round(number * scale * (1 + Number.EPSILON)) / scale);
};
