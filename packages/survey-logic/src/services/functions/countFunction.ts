import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";

// The number of values passed, arrays flattened. An unanswered value is not counted, but an empty text is, as SurveyJS counts it
export const countFunction: SurveyLogicFunction = (args) => {
  const values = flattenSurveyValues(args);
  return values.length;
};
