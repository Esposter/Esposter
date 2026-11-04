import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { getSurveyNumberWithPrecision } from "#src/services/shared/getSurveyNumberWithPrecision";

// The product is rounded to this many digits before it is cut. Float noise can put a digit below the cut:
// For example, -4.89 times 100 is -488.99999999999994, and cut as it is it would read -4.88
const PRODUCT_DIGITS = 15;

// The number cut to a number of decimal places, or to its whole part when the precision is not a positive whole number
export const truncFunction: SurveyLogicFunction = (args) => {
  const numberWithPrecision = getSurveyNumberWithPrecision(args);
  if (numberWithPrecision === undefined) return undefined;

  const [number, precision] = numberWithPrecision;
  const places = Number.isInteger(precision) && precision > 0 ? precision : 0;
  if (places === 0) return Math.trunc(number);
  // A number with no digits past the places is itself, so a whole number in exponent form is not moved by its scale
  if (countSurveyLogicDecimals(number) <= places) return number;

  const scale = 10 ** places;
  return Math.trunc(Number((number * scale).toPrecision(PRODUCT_DIGITS))) / scale;
};
