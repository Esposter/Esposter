import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { MAX_DECIMAL_PLACES } from "#src/services/constants";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The number and the precision a rounding function reads from its arguments (R5): the first value is the number, and the second
// Is the precision, which is zero when it is empty. A precision is a whole number from zero to MAX_DECIMAL_PLACES, so any other
// Precision, and a value or a precision that reads as no number, has no result
export const getSurveyNumberWithPrecision = (args: SurveyLogicValue[]): [number, number] | undefined => {
  const [value, precisionValue] = args;
  const number = toSurveyLogicNumber(value);
  const precision = checkIsSurveyLogicValueEmpty(precisionValue) ? 0 : toSurveyLogicNumber(precisionValue);
  if (number === undefined || precision === undefined) return undefined;
  if (!Number.isInteger(precision) || precision < 0 || precision > MAX_DECIMAL_PLACES) return undefined;

  return [number, precision];
};
