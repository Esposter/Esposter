import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";

// The number of values that read as a number, arrays flattened. An empty value or a text that is not a number is not counted
export const countFunction: SurveyLogicFunction = (args) => {
  const numbers = flattenSurveyNumbers(args);

  return numbers.length;
};
