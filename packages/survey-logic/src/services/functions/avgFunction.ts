import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { sumSurveyValues } from "#src/services/shared/sumSurveyValues";

// The average of the values passed, arrays flattened: their total over how many there are.
// The total goes through the sum's text join, as SurveyJS's does, so an empty text joins it as text.
// That text still counts in the divisor. With no values the average is 0, as SurveyJS gives it
export const avgFunction: SurveyLogicFunction = (args) => {
  const values = flattenSurveyValues(args);
  if (values.length === 0) return 0;

  const total = sumSurveyValues(values);
  return total === undefined ? undefined : Number(total) / values.length;
};
