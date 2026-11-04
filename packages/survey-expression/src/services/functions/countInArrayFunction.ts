import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";

// The number of items whose field reads as a number. A filter is empty for the reason sumInArray gives
export const countInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined) return undefined;

  return params.rows.length;
};
