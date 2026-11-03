import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// The number and the precision a rounding function reads from its arguments: the first value is the number, and the
// Second is the precision, which is zero when empty. Either is NaN when it does not read as a number
export const getSurveyNumberWithPrecision = (args: SurveyLogicValue[]): [number, number] => {
  const values = flattenSurveyValues(args);

  return [getSurveyNumber(values[0]), getSurveyNumber(values[1] || 0)];
};
