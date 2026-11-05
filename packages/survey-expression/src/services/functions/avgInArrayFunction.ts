import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { averageSurveyNumbers } from "#src/services/shared/averageSurveyNumbers";
import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";

// The average of a field over the items whose field reads as a number.
// A filter has no average for the reason sumInArray gives, and no items have none
export const avgInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  return params === undefined ? undefined : averageSurveyNumbers(params.rows.map((row) => row.field));
};
