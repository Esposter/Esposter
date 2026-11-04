import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";
import { sumSurveyNumbers } from "#src/services/shared/sumSurveyNumbers";

// The average of a field over the items whose field reads as a number.
// A filter has no average for the reason sumInArray gives, and no items have none
export const avgInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined || params.rows.length === 0) return undefined;

  const total = sumSurveyNumbers(params.rows.map((row) => row.field));
  return total === undefined ? undefined : total / params.rows.length;
};
