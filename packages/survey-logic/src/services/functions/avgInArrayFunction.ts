import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";
import { getSurveyArrayValue } from "#src/services/shared/getSurveyArrayValue";
import { sumSurveyValues } from "#src/services/shared/sumSurveyValues";

// The average of a field over the items of an array value, over the items whose field holds a value. A filter is empty for
// The reason sumInArray gives
export const avgInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined) return 0;
  if (params.isFiltered) return undefined;
  if (params.rows.length === 0) return 0;

  const total = sumSurveyValues(params.rows.map((row) => getSurveyArrayValue(row.field)));
  return total === undefined ? undefined : Number(total) / params.rows.length;
};
