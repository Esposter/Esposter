import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// The number rounded to a number of decimal places, or to a whole number when the precision is empty
export const roundFunction: SurveyLogicFunction = (args) => {
  const values = flattenSurveyValues(args);
  const number = getSurveyNumber(values[0]);
  const precision = getSurveyNumber(values[1] || 0);

  if (Number.isNaN(number) || Number.isNaN(precision)) return Number.NaN;

  // The scaled value is nudged up by Number.EPSILON before Math.round, as SurveyJS does.
  // That nudge rounds a half away from zero, where Math.round alone would send -2.5 to -2.
  const scale = 10 ** precision;

  return Math.round(number * scale * (1 + Number.EPSILON)) / scale;
};
