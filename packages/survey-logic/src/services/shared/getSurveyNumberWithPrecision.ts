import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The number and the precision a rounding function reads from its arguments: the first value is the number, and the second is the precision, which is zero when it is empty.
// Undefined when either reads as no number
export const getSurveyNumberWithPrecision = (args: SurveyLogicValue[]): [number, number] | undefined => {
  const [value, precisionValue] = args;
  const number = toSurveyLogicNumber(value);
  const precision = checkIsSurveyLogicValueEmpty(precisionValue) ? 0 : toSurveyLogicNumber(precisionValue);

  return number === undefined || precision === undefined ? undefined : [number, precision];
};
