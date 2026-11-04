import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";
import { sumSurveyNumbers } from "#src/services/shared/sumSurveyNumbers";

// The average of the numbers the values read as, arrays flattened: their total over how many there are.
// Nothing to average has no average
export const avgFunction: SurveyLogicFunction = (args) => {
  const numbers = flattenSurveyNumbers(args);
  if (numbers.length === 0) return undefined;

  const total = sumSurveyNumbers(numbers);
  return total === undefined ? undefined : total / numbers.length;
};
