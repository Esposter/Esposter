import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";
import { getSurveyArrayValue } from "#src/services/shared/getSurveyArrayValue";
import { sumSurveyValues } from "#src/services/shared/sumSurveyValues";

// The sum of a field over the items of an array value. A filter is a condition over each item, which the arguments do not
// Carry, so a call that passes one is empty rather than summed without it
export const sumInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined) return 0;
  if (params.isFiltered) return undefined;

  return sumSurveyValues(params.rows.map((row) => getSurveyArrayValue(row.field)));
};
