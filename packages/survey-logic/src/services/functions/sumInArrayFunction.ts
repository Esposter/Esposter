import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";
import { sumSurveyNumbers } from "#src/services/shared/sumSurveyNumbers";

// The sum of a field over the items whose field reads as a number.
// A filter is a condition over each item, which the arguments do not carry, so a call that passes one has no sum
export const sumInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined) return undefined;
  if (params.isFiltered) return undefined;

  return sumSurveyNumbers(params.rows.map((row) => row.field));
};
