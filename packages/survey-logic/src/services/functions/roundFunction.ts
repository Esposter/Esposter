import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyLogicArguments } from "#src/services/shared/flattenSurveyLogicArguments";
import { getSurveyLogicNumber } from "#src/services/shared/getSurveyLogicNumber";

// The number rounded to a number of decimal places, or to a whole number when the precision is empty
export const roundFunction: SurveyLogicFunction = (args) => {
  const values = flattenSurveyLogicArguments(args);
  const number = getSurveyLogicNumber(values[0]);
  const precision = getSurveyLogicNumber(values[1] || 0);

  if (number === undefined || precision === undefined) return Number.NaN;

  // The scaled value is nudged up by Number.EPSILON before Math.round, as SurveyJS does.
  // That nudge rounds a half away from zero, where Math.round alone would send -2.5 to -2.
  const scale = 10 ** precision;

  return Math.round(number * scale * (1 + Number.EPSILON)) / scale;
};
