import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// The number cut to a number of decimal places, or to its whole part when the precision is empty
export const truncFunction: SurveyLogicFunction = (args) => {
  const values = flattenSurveyValues(args);
  const number = getSurveyNumber(values[0]);
  const precision = getSurveyNumber(values[1] || 0);

  if (Number.isNaN(number) || Number.isNaN(precision)) return Number.NaN;

  // Only a whole, positive precision reads decimals, as in SurveyJS, where any other precision keeps the whole part.
  // The dot is unescaped as SurveyJS writes it, so a number in exponent form reads as it does there
  const decimalPlaces = Number.isInteger(precision) && precision > 0 ? precision : 0;
  const truncateRegex = new RegExp(
    decimalPlaces > 0 ? String.raw`^-?\d+(?:.\d{0,${decimalPlaces}})?` : String.raw`^-?\d+`,
    "u",
  );

  return Number(`${number}`.match(truncateRegex)?.[0]);
};
