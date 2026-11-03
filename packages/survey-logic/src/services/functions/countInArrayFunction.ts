import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";

// The number of items of an array value whose field holds a value. A filter is empty for the reason sumInArray gives
export const countInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined) return 0;
  if (params.isFiltered) return undefined;

  return params.rows.length;
};
